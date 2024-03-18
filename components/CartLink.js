import { useState, useEffect } from 'react'
import { ContextProviderComponent, SiteContext } from '../context/mainContext'
import { FaShoppingCart, FaCircle } from 'react-icons/fa';
import Link from "next/link"
import { colors } from '../theme'
const { primary } = colors

function CartLink(props) {
  let { context: { numberOfItemsInCart = 0 }} = props
  //const [renderClientSideComponent, setRenderClientSideComponent] = useState(false)
  /*useEffect(() => {
    setRenderClientSideComponent(true)
  }, [])*/
  
  return (
    <div>
      <div className="flex flex-1 justify-end pr-4 relative">
        <Link href="/cart" aria-label="Cart">

          <FaShoppingCart />

        </Link>
        {
          renderClientSideComponent && numberOfItemsInCart > Number(0) && (
            <FaCircle color={primary} size={12} suppressHydrationWarning />
          )
        }
      </div>
    </div>
  );
}

function CartLinkWithContext(props) {
  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {
          context => <CartLink {...props} context={context} />
        }
      </SiteContext.Consumer>
    </ContextProviderComponent>
  )
}

export default CartLinkWithContext