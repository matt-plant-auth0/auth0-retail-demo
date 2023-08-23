import inventory from './inventory'

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
  // const inventory = API.get(apiUrl)
  if(process.env.INVENTORY_URL){
    let res = await fetch(process.env.INVENTORY_URL);
    let remoteInventory = await res.json();
    return Promise.resolve(remoteInventory);
  }else{
    return Promise.resolve(inventory)
  }
}

export {
  fetchInventory, inventory as staticInventory
}