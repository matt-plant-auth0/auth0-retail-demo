import { useState, useEffect } from 'react'
import DENOMINATION from "../../utils/currencyProvider"
import Image from "../../components/Image"
import { useUser } from '@auth0/nextjs-auth0/client';
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export default function Orders (props){
  const { user, error, isLoading } = useUser();
  const [errorMessage, setErrorMessage] = useState(null)
  const [userOrders, setUserOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    async function getUserOrders() {
      let res = await fetch('/api/user/profile');
      let fullUser = await res.json();
      setUserOrders(fullUser.app_metadata.orders);
    }
    getUserOrders();
  }, []);

  useEffect(() => {
    if(userOrders.length > 0){
      async function getOrderDetails() {
        let tmpOrderDetails = [];
        for(var i = 0; i < userOrders.length; i++){
          let res = await fetch(`/api/orders/${userOrders[i]}`);
          let order = await res.json();
          tmpOrderDetails.push(order);
        }
        setOrderDetails(tmpOrderDetails);
        setOrdersLoading(false);
      }
      getOrderDetails();
    }
  }, [userOrders]);

  if (isLoading || ordersLoading) return <div>Loading...</div>;

  if (error) return <div>{error.message}</div>;

  return (
      <div className="flex flex-col items-center pb-10">
        <div className="flex flex-col w-full c_large:w-c_large">
          <div className="pt-10 pb-8 border-b">
            <h2 className="text-5xl font-light mb-6">Previous orders</h2>
          </div>
          {orderDetails.map((details, index) => {
            return (
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between rounded-lg border-b px-4 py-2 text-left text-sm font-medium">
                      <div className='flex gap-20 justify-cneter'>
                        <span className='flex-auto'>Order Placed: {new Date(details.created).toLocaleString()}</span>
                        <span className='flex-auto'>Number of items: {details.orderItems.length}</span>
                        <span className='flex-auto'>Total: {DENOMINATION + details.amount}</span>
                        <span className='flex-auto'>#{details.id}</span>
                      </div>
                      <ChevronDownIcon
                        className={`${
                          open ? 'rotate-180 transform' : ''
                        } h-5 w-5 text-purple-500`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                      <div className="pt-10">
                        <div className="flex items-center">
                          <h3>Order summary:</h3>
                        </div>
                      </div>
                      {details.orderItems.map((item, index) => {
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
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            )
          })}
        </div>
      </div>
  );
}

export const getServerSideProps = withPageAuthRequired();
