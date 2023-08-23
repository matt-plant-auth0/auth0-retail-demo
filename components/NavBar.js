import { useState, useEffect } from 'react'
import { Disclosure } from '@headlessui/react'
import { navItemLength } from '../ecommerce.config'
import { slugify } from '../utils/helpers'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import CartLink from '../components/CartLink'
import ProfileLink from './ProfileLink';
import { ContextProviderComponent, SiteContext } from '../context/mainContext'


function buildNavItems(categories){
    if (categories.length > navItemLength) {
        categories = categories.slice(0, navItemLength)
    }

    let nav = categories.map(category => {
        return { name: category.charAt(0).toUpperCase() + category.slice(1), href: `/category/${slugify(category)}`, current: false };
    });

    nav.unshift({ name: 'Home', href: '/', current: false });

    return nav;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function NavBar(props) {
    const { categories } = props;
    let navigation = buildNavItems(categories);
    return (
        <Disclosure as="nav">
        {({ open }) => (
            <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button*/}
                    <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                    </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                    <div className="flex flex-shrink-0 items-center">
                    <img
                        className="h-8 w-auto"
                        src="/a0_by_okta.png"
                        alt="Auth0 Retail Demo"
                    />
                    </div>
                    <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                        {navigation.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                            item.current ? 'bg-gray-900 text-white' : 'hover:bg-gray-700 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium'
                            )}
                            aria-current={item.current ? 'page' : undefined}
                        >
                            {item.name}
                        </a>
                        ))}
                    </div>
                    </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <CartLink/>
                    {/* Profile dropdown */}
                    <ProfileLink/>
                </div>
                </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                    <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                    >
                    {item.name}
                    </Disclosure.Button>
                ))}
                </div>
            </Disclosure.Panel>
            </>
        )}
        </Disclosure>
  )
}

function NavBarWithContext(props) {
    return (
      <ContextProviderComponent>
        <SiteContext.Consumer>
          {
            context => <NavBar {...props} context={context} />
          }
        </SiteContext.Consumer>
      </ContextProviderComponent>
    )
  }
  
  export default NavBarWithContext