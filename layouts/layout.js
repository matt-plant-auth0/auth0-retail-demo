import { Children, cloneElement, useState } from 'react'
import Link from 'next/link'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { navItemLength } from '../ecommerce.config'
import NavBar from '../components/NavBar'
import { SiteContext, ContextProviderComponent } from '../context/mainContext'

function Layout(props) {
  let { children, categories, context: { addToCart, removeFromCart } } = props;
  const [input, setInput] = useState({ email: "" });
  const [hasSubscribed, setHasSubscribed] = useState(false);

  const addToCartParent = (item) => {
    addToCart(item);
  }

  const removeFromCartParent = (item) => {
    removeFromCart(item);
  }

  const renderChildren = () => {
    return Children.map(children, (child) => {
      return cloneElement(child, {
        addToCartParent: addToCartParent,
        removeFromCartParent: removeFromCartParent,
      });
    });
  }

  const handleOnChange = (e) => {
    setInput({ email: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    //magic link cannot be fudged just yet it seems...
    /*await fetch('/api/user/subscribe', { 
      method: 'POST', 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.email })
    });*/

    window.location.href = `/api/auth/login?connection=email&login_hint=${input.email}`

    setHasSubscribed(true);
  }

  return (
    <div>
      <NavBar categories={categories}/>
      <div className="mobile:px-10 px-4 pb-10 flex justify-center">
        <main className="w-fw">{renderChildren()}</main>
      </div>
      <footer className="flex justify-center">
        <div className="
        sm:flex-row sm:items-center
        flex-col
        flex w-fw px-12 py-8
        desktop:px-0
        border-solid
        border-t border-gray-300">
          <div className="sm:justify-start flex flex-1 mt4">
            <span className="block text-gray-700 text-xs">Copyright © 2023 Okta. All rights reserved.</span>
          </div>
          <div className="sm:justify-center flex flex-1 mt4 bg-primary">
              <form className="flex flex-col justify-center py-4" onSubmit={handleSubmit}>
                <h2 className="flex flex-row text-gray-700 text-xl">Want To Get 10% Off Your Next Order?*</h2>
                <input className="flex flex-row my-4 py-2 text-gray-700 leading-tight border focus:outline-none focus:shadow-outline" type='text' placeholder='Enter email...' value={input.email} onChange={handleOnChange}></input>
                {!hasSubscribed && (
                  <button className='flex flex-row bg-transparent hover:bg-black hover:text-white text-black font-bold py-2 px-2 mt-2 border-2 border-black hover:border-transparent justify-center' type='submit' onSubmit={handleSubmit}>Sign me up!</button>
                )}
                {hasSubscribed && (
                  <>
                    <button className='flex flex-row bg-transparent text-black font-bold py-2 px-2 mt-2 border-2 border-black justify-center' type='submit' disabled onSubmit={handleSubmit}>Thanks for subscribing!</button>
                    <span className="flex flex-row text-gray-700 pt-4">Please wait while we redirect you to verify your email...</span>
                  </>
                )}
                <span className="flex flex-row text-gray-700 text-xs pt-4">*By subscribing you agree to our privacy policy and T&Cs</span>
              </form>
          </div>
          <div className="
            sm:justify-end sm:m-0
            flex flex-1 mt-4
          ">
            <Link href="/admin" aria-label="Admin panel">

              <p className="text-sm font-semibold">Supplier Portal</p>

            </Link>
          </div>
        </div>
      </footer>
      <ToastContainer autoClose={3000} />
    </div>
  );
}

function LayoutWithContext(props) {
  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {
          context => <Layout {...props} context={context} />
        }
      </SiteContext.Consumer>
    </ContextProviderComponent>
  )
}

export default LayoutWithContext