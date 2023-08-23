import '../styles/globals.css'
import Layout from '../layouts/layout'
import fetchCategories from '../utils/categoryProvider'
import { UserProvider } from '@auth0/nextjs-auth0/client';

function Ecommerce({ Component, pageProps, categories }) {
  return (
    <UserProvider>
      <Layout categories={categories}>
        <Component {...pageProps} />
      </Layout>
    </UserProvider>
  )
}

Ecommerce.getInitialProps = async () => {
  const categories = await fetchCategories()
  return {
    categories
  }
}

export default Ecommerce