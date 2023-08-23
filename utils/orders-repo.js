import { v4 as uuid } from "uuid";

const fs = require('fs');

// orders in JSON file for simplicity, store in a db for production applications
let orders = require('../data/orders.json');

export const ordersRepo = {
    getAll: () => orders,
    getById: id => orders.find(x => x.id.toString() === id.toString()),
    find: x => orders.find(x),
    filter: x => orders.filter(x),
    create,
    update
};

function create(order) {
    // generate new order id if not present
    if(!order.id){
        order.id = uuid();
    }

    // set date created and updated
    order.created = Date.now();
    order.lastUpdated = Date.now();

    // add and save order
    orders.push(order);
    saveData();
    return order.id;
}

function update(id, params) {
    const order = orders.find(x => x.id.toString() === id.toString());

    // set date updated
    order.lastUpdated = Date.now();

    // update and save
    Object.assign(order, params);
    saveData();
}


// private helper functions

function saveData() {
    fs.writeFileSync('data/orders.json', JSON.stringify(orders, null, 4));
}