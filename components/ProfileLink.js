import { Fragment } from 'react'
import { FaUser } from 'react-icons/fa';
import { Menu, Transition } from '@headlessui/react'
import { useUser } from '@auth0/nextjs-auth0/client';

export default function ProfileLink(props) {
  const { user, isLoading } = useUser();

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="relative flex rounded-full">
          <span className="sr-only">Open user menu</span>
          <FaUser />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        { !user && (
          <>
          <Menu.Item>
            {({ active }) => (
              <a
                href="/api/auth/login"
                className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
              >
                Sign in
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="/api/auth/signup"
                className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
              >
                Create Account
              </a>
            )}
          </Menu.Item>
          </>
        )}
        { user && (
          <>
          <Menu.Item>
            {({ active }) => (
              <a
                href="/account/profile"
                className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
              >
                Your Profile
              </a>
            )}
          </Menu.Item>
          { !user.isSubscriptionAccount && (
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/account/orders"
                  className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                >
                  Orders
                </a>
              )}
            </Menu.Item>
          )}
          <Menu.Item>
            {({ active }) => (
              <a
                href="/api/auth/logout"
                className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
              >
                Sign out
              </a>
            )}
          </Menu.Item>
          </>
        )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}