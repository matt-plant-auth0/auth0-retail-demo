import { useState, useEffect } from 'react'
import Head from 'next/head'
import DENOMINATION from "../../utils/currencyProvider"
import { FaLongArrowAltLeft } from "react-icons/fa"
import Link from "next/link"
import Image from "../../components/Image"
import { useUser } from '@auth0/nextjs-auth0/client';
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default function Profile (props){
  const { user, error, isLoading } = useUser();
  const [errorMessage, setErrorMessage] = useState(null)
  const [userOrders, setUserOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
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
        let res = await fetch(`/api/orders/${userOrders[0]}`);
        let order = await res.json();
        setOrderDetails(order);
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
          <div className="pt-10">
            <div className="flex items-center">
              <h3>Order summary:</h3>
            </div>
          </div>
          {orderDetails.orderItems.map((item, index) => {
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
      </div>
  );
}

export const getServerSideProps = withPageAuthRequired();
