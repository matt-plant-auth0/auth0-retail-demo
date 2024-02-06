import { useState, useEffect } from 'react'
import Head from 'next/head'
import { toast } from 'react-toastify'
import { useUser } from '@auth0/nextjs-auth0/client';
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

const Input = ({ onChange, value, name, placeholder, readOnly = false }) => (
  <input
    onChange={onChange}
    value={value}
    className="mt-2 text-sm shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    type="text"
    placeholder={placeholder}
    name={name}
    readOnly={readOnly}
  />
)

export default function Profile (props){
  const { user, error, isLoading } = useUser();
  
  //console.log(accessToken);
  const [errorMessage, setErrorMessage] = useState(null)
  const [input, setInput] = useState({
    given_name: "",
    family_name: "",
    email: "",
    weekly_emails: false,
    partner_emails: false
  })
  const [createdTimestamp, setCreatedTimestamp] = useState(null);

  useEffect(() => {
    //move these to ID token to avoid extra API call
    async function getFullUser() {
      let res = await fetch('/api/user/profile');
      let fullUser = await res.json();
      setInput({
        given_name: fullUser.given_name,
        family_name: fullUser.family_name,
        email: fullUser.email,
        weekly_emails: fullUser.app_metadata?.weekly_emails,
        partner_emails: fullUser.app_metadata?.partner_emails
      })
      setCreatedTimestamp(fullUser.app_metadata?.terms_accepted);
      console.log(user);
    }
    getFullUser();
  }, []);

  useEffect(() => {
    if(!isLoading){
      console.log(user);
      
    }
  }, [isLoading]);


  const onChange = e => {
    setErrorMessage(null)
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const checkboxChange = e => {
    setErrorMessage(null)
    console.log(e);
    setInput({ ...input, [e.target.name]: e.target.checked })
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const { given_name, family_name, email, weekly_emails, partner_emails } = input

    let res = await fetch('/api/user/profile', { 
      method: 'PUT', 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(input)
    });

    let updatedAccount = await res.json();

    toast("Profile successfully updated!", {
      position: toast.POSITION.TOP_LEFT
    })
  }

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>{error.message}</div>;

  return (
    <div className="flex flex-col items-center pb-10">
      <Head>
        <title>Jamstack ECommerce - Checkout</title>
        <meta name="description" content={`Check out`} />
        <meta property="og:title" content="Jamstack ECommerce - Checkpit" key="title" />
      </Head>
      <div className="flex flex-col w-full c_large:w-c_large">
        <div className="pt-10 pb-6">
          <h1 className="text-5xl font-light mb-6">Your Profile</h1>
          
        </div>

          
            <div className="flex flex-1 flex-col md:flex-row">
              <div className="flex flex-1 pt-8 flex-col">
                <div className="mt-4 border-t pt-4">
                  <form onSubmit={handleSubmit}>
                    {errorMessage ? <span>{errorMessage}</span> : ""}
                    <Input
                      onChange={onChange}
                      value={input.email}
                      name="email"
                      placeholder="Email"
                      readOnly={true}
                    />
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
                    <div className="mt-4 border-t pt-4">
                      <h2>Marketing & Communication Preferences</h2>
                      <label className='md:block pt-4' htmlFor='terms'>
                        <input
                          onChange={checkboxChange}
                          className="mt-2 shadow py-2 px-3 leading-tight"
                          type="checkbox"
                          name="weekly_emails"
                          checked={input.weekly_emails}
                        />
                        <span className='text-gray-600 text-sm py-2 px-3'>Sign me up to weekly email offers</span>
                      </label>
                      <label className='md:block' htmlFor='privacy'>
                        <input
                          onChange={checkboxChange}
                          className="mt-2 shadow py-2 px-3 leading-tight"
                          type="checkbox"
                          name="partner_emails"
                          checked={input.partner_emails}
                        />
                        <span className='text-gray-600 text-sm py-2 px-3'>Please send me exclusive discounts from our selected partner organisations </span>
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="hidden md:block bg-primary hover:bg-black text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
                      
                    >
                      Update Profile
                    </button>
                  </form>
                  <div className="sm:justify-start flex flex-1 mt-4">
                    <span className="block text-gray-700 text-xs">Profile created {new Date(createdTimestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

  );
}

export const getServerSideProps = withPageAuthRequired();
