import { useState, useEffect } from 'react'
import Head from 'next/head'
import { SiteContext, ContextProviderComponent } from "../context/mainContext"
import DENOMINATION from "../utils/currencyProvider"
import { FaLongArrowAltLeft } from "react-icons/fa"
import Link from "next/link"
import Image from "../components/Image"
import { v4 as uuid } from "uuid"
import { useUser } from '@auth0/nextjs-auth0/client';
import { setCookie } from 'cookies-next';

import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe("xxx-xxx-xxx")

function CheckoutWithContext(props) {
  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {context => (
          <Elements stripe={stripePromise}>
            <Checkout {...props} context={context} />
          </Elements>
        )}
      </SiteContext.Consumer>
    </ContextProviderComponent>
  )
}

const calculateShipping = () => {
  return 0
}

const Input = ({ onChange, value, name, placeholder }) => (
  <input
    onChange={onChange}
    value={value}
    className="mt-2 text-sm shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    type="text"
    placeholder={placeholder}
    name={name}
  />
)


const Checkout = ({ context }) => {
  const { user, isLoading } = useUser();
  const { numberOfItemsInCart, cart, total } = context
  const [errorMessage, setErrorMessage] = useState(null)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [input, setInput] = useState({
    given_name: "",
    family_name: "",
    email: "",
    street: "",
    city: "",
    postal_code: "",
    state: "",
    terms: false,
    privacy: false
  })
  const [lastOrder, setLastOrder] = useState({
    id: "",
    email: "",
    amount: "",
    address: {
      street: "", 
      city: "", 
      postal_code: "", 
      state: ""
    },
    orderItems: []
  })
  const [personalDetails, setPersonalDetails] = useState({
    given_name: "",
    family_name: "",
    email: ""
  })
  useEffect(() => {
    if(user && !isLoading){
      setInput({
        given_name: user.name !== user.email ? user.name.split(' ')[0] : "",
        family_name: user.name !== user.email ? user.name.split(' ')[0] : "",
        email: user.email,
        street: "",
        city: "",
        postal_code: "",
        state: "",
        terms: false,
        privacy: false
      })
    }
  }, [user, isLoading])

  const stripe = useStripe()
  const elements = useElements()

  const onChange = e => {
    setErrorMessage(null)
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const createAccount = async event => {
    event.preventDefault()
    const { terms, privacy } = input;

    if (user && !user.isSubscriptionAccount && (!terms || !privacy)) {
      console.log("Consent not accepted!");
      setErrorMessage("Please accept both below to continue!");
      return
    }

    /*let res = await fetch('/api/user', { 
      method: 'POST', 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ personalDetails: personalDetails })
    });

    let account = await res.json();

    console.log("Account created successfully!");

    setCookie('current_email', personalDetails.email);

    window.location.href = account.setPasswordUrl;*/

    window.location.href = `/api/auth/login?login_hint=${personalDetails.email}&screen_hint=signup&account_details=${JSON.stringify(personalDetails)}`;

  }

  const handleSubmit = async event => {
    event.preventDefault()
    const { given_name, family_name, email, street, city, postal_code, state } = input
    const { total, clearCart } = context

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return
    }

    // Validate input
    if (!email || !street || !city || !postal_code || !state) {
      setErrorMessage("Please fill in the form!")
      return
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    /*const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { name: name },
    })

    if (error) {
      setErrorMessage(error.message)
      return
    }*/

    setPersonalDetails({
      given_name: given_name,
      family_name: family_name,
      email: email
    });
    
    let lastOrder = {
      id: uuid(),
      email: email,
      amount: total,
      address: {
        street: street, 
        city: city, 
        postal_code: postal_code, 
        state: state
      },
      orderItems: cart.map(item => {
        let simplifiedItem = {
          name: item.name,
          price: item.price,
          image: item.image,
          id: item.id,
        }
        return simplifiedItem;
      })
    }

    setLastOrder(lastOrder)

    let res = await fetch('/api/orders', { 
      method: 'POST', 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ order: lastOrder })
    });

    let orderId = await res.json();

    console.log(`Order ${orderId.orderId} created successfully`);

    if(user && !user.isSubscriptionAccount){
      await fetch('/api/user/add-order', { 
        method: 'PUT', 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ orderId: orderId.orderId })
      });
    }
    
    setOrderCompleted(true)
    clearCart()
  }

  
  const cartEmpty = numberOfItemsInCart === Number(0)

  if (orderCompleted) {
    return (
      <div className="flex flex-col items-center pb-10">
        <div className="flex flex-col w-full c_large:w-c_large">
          <div className="pt-10 pb-8 border-b">
            <h2 className="text-5xl font-light mb-6">Thank you - your order was successful!</h2>
            { user && (
              <Link href="/account/orders" aria-label="Orders">
                <div className="cursor-pointer flex  items-center">
                  <FaLongArrowAltLeft className="mr-2 text-gray-600" />
                  <p className="text-gray-600 text-sm">View your previous orders</p>
                </div>
              </Link>
            )}
          </div>
          <div className="pt-10">
            <div className="flex items-center">
              <h3>Order summary:</h3>
            </div>
          </div>
          {lastOrder.orderItems.map((item, index) => {
            return (
              <div className="border-b py-10" key={index}>
                <div className="flex items-center">
                  <Image
                    className="w-32 m-0"
                    src={item.image}
                    alt={item.name}
                  />
                  <p className="m-0 pl-10 text-gray-600">
                    {item.name}
                  </p>
                  <div className="flex flex-1 justify-end">
                    <p className="m-0 pl-10 text-gray-900 font-semibold">
                      {DENOMINATION + item.price}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {!user && (
          <>
          <div className="flex flex-1 flex-col md:flex-row">
              <div className="flex flex-1 pt-8 flex-col">
                <div className="mt-4 pt-10">
                <div className="pt-10">
                  <Link href="#" onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('createAccountForm').className = '';
                  }} aria-label="Cart">
                    <div className="cursor-pointer flex  items-center">
                      <p className="text-gray-600 text-sm">Would you like to create an account? Click here!</p>
                    </div>
                  </Link>
                </div>
                  <form id='createAccountForm' className='hidden' onSubmit={createAccount}>
                    {errorMessage ? <span>{errorMessage}</span> : ""}
                    <label className='md:block' htmlFor='terms'>
                      <input
                        onChange={onChange}
                        className="mt-2 shadow py-2 px-3 leading-tight"
                        type="checkbox"
                        name="terms"
                      />
                      <span className='text-gray-600 text-sm py-2 px-3'>I accept the terms and conditions</span>
                    </label>
                    <label className='md:block' htmlFor='privacy'>
                      <input
                        onChange={onChange}
                        className="mt-2 shadow py-2 px-3 leading-tight"
                        type="checkbox"
                        name="privacy"
                      />
                      <span className='text-gray-600 text-sm py-2 px-3'>I agree that my data will be held in accordance to the privacy policy</span>
                    </label>
                    <button
                      type="submit"
                      disabled={!stripe}
                      onClick={createAccount}
                      className="md:block bg-primary hover:bg-black text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Continue
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
        {(user && user.isSubscriptionAccount) && (
          <>
          <div className="flex flex-1 flex-col md:flex-row">
              <div className="flex flex-1 pt-8 flex-col">
                <div className="mt-4 pt-10">
                <div className="pt-10">
                  <Link href="#" onClick={(e) => {createAccount(e)}} aria-label="Cart">
                    <div className="cursor-pointer flex  items-center">
                      <p className="text-gray-600 text-sm">Would you like to convert to a full account so you can manage your orders? Click here!</p>
                    </div>
                  </Link>
                </div>
                  <form id='createAccountForm' className='hidden' onSubmit={createAccount}>
                    {errorMessage ? <span>{errorMessage}</span> : ""}
                    <label className='md:block' htmlFor='terms'>
                      <input
                        onChange={onChange}
                        className="mt-2 shadow py-2 px-3 leading-tight"
                        type="checkbox"
                        name="terms"
                      />
                      <span className='text-gray-600 text-sm py-2 px-3'>I accept the terms and conditions</span>
                    </label>
                    <label className='md:block' htmlFor='privacy'>
                      <input
                        onChange={onChange}
                        className="mt-2 shadow py-2 px-3 leading-tight"
                        type="checkbox"
                        name="privacy"
                      />
                      <span className='text-gray-600 text-sm py-2 px-3'>I agree that my data will be held in accordance to the privacy policy</span>
                    </label>
                    <button
                      type="submit"
                      disabled={!stripe}
                      onClick={createAccount}
                      className="md:block bg-primary hover:bg-black text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Continue
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center pb-10">
      <Head>
        <title>Jamstack ECommerce - Checkout</title>
        <meta name="description" content={`Check out`} />
        <meta property="og:title" content="Jamstack ECommerce - Checkpit" key="title" />
      </Head>
      <div className="flex flex-col w-full c_large:w-c_large">
        <div className="pt-10 pb-8">
          <h1 className="text-5xl font-light mb-6">Checkout</h1>
          <Link href="/cart" aria-label="Cart">

            <div className="cursor-pointer flex  items-center">
              <FaLongArrowAltLeft className="mr-2 text-gray-600" />
              <p className="text-gray-600 text-sm">Edit Cart</p>
            </div>

          </Link>
        </div>

        {cartEmpty ? (
          <h3>No items in cart.</h3>
        ) : (
          <div className="flex flex-col">
            <div className="">
              {cart.map((item, index) => {
                return (
                  <div className="border-b py-10" key={index}>
                    <div className="flex items-center">
                      <Image
                        className="w-32 m-0"
                        src={item.image}
                        alt={item.name}
                      />
                      <p className="m-0 pl-10 text-gray-600">
                        {item.name}
                      </p>
                      <div className="flex flex-1 justify-end">
                        <p className="m-0 pl-10 text-gray-900 font-semibold">
                          {DENOMINATION + item.price}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-1 flex-col md:flex-row">
              <div className="flex flex-1 pt-8 flex-col">
                <div className="mt-4 border-t pt-10">
                  <form onSubmit={handleSubmit}>
                    {errorMessage ? <span>{errorMessage}</span> : ""}
                    <Input
                      onChange={onChange}
                      value={input.given_name}
                      name="given_name"
                      placeholder="First name"
                    />
                    <Input
                      onChange={onChange}
                      value={input.family_name}
                      name="family_name"
                      placeholder="Last name"
                    />
                    <CardElement className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    <Input
                      onChange={onChange}
                      value={input.email}
                      name="email"
                      placeholder="Email"
                    />
                    <Input
                      onChange={onChange}
                      value={input.street}
                      name="street"
                      placeholder="Street"
                    />
                    <Input
                      onChange={onChange}
                      value={input.city}
                      name="city"
                      placeholder="City"
                    />
                    <Input
                      onChange={onChange}
                      value={input.state}
                      name="state"
                      placeholder="State/County"
                    />
                    <Input
                      onChange={onChange}
                      value={input.postal_code}
                      name="postal_code"
                      placeholder="Postal Code"
                    />
                    <button
                      type="submit"
                      disabled={!stripe}
                      onClick={handleSubmit}
                      className="hidden md:block bg-primary hover:bg-black text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
                      
                    >
                      Confirm order
                    </button>
                  </form>
                </div>
              </div>
              <div className="md:pt-20">
                <div className="pl-4 flex flex-1 pt-2 md:pt-8 mt-2 sm:mt-0">
                  <p className="text-sm pr-10 text-left">Subtotal</p>
                  <p className="w-38 flex text-right justify-end">
                    {DENOMINATION + total}
                  </p>
                </div>
                <div className="pl-4 flex flex-1 my-2">
                  <p className="text-sm pr-10">Shipping</p>
                  <p className="w-38 flex justify-end">
                    FREE SHIPPING
                  </p>
                </div>
                <div className="md:ml-4 pl-2 flex flex-1 bg-gray-200 pr-4 pb-1 pt-2 mt-2">
                  <p className="text-sm pr-10">Total</p>
                  <p className="font-semibold w-38 flex justify-end">
                    {DENOMINATION + (total + calculateShipping())}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!stripe}
                  onClick={handleSubmit}
                  className="md:hidden bg-primary hover:bg-black text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
                  
                >
                  Confirm order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutWithContext