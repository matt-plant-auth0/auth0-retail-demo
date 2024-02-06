import { v4 as uuid } from 'uuid'
const inventory = require('../data/default_inventory.json');

/*
Inventory items should adhere to the following schema:
type Product {
  id: ID!
  categories: [String]!
  price: Float!
  name: String!
  image: String!
  description: String!
  currentInventory: Int!
  brand: String
  sku: ID
}
*/

async function fetchInventory() {

  let currentInventory = [];

  if(process.env.INVENTORY_URL){
    let res = await fetch(process.env.INVENTORY_URL);
    currentInventory = await res.json();
  }else{
    currentInventory = inventory;
  }

  currentInventory.map(i => {
    i.id = uuid()
    return i
  })

  return Promise.resolve(currentInventory)
}

export {
  fetchInventory
}