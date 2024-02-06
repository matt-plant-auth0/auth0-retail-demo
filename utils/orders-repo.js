import { v4 as uuid } from "uuid";
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const bucket = process.env.S3_BUCKET;

const client = new S3Client({
    credentials: {
        accessKeyId,
        secretAccessKey
    },
    region,
    apiVersion: '2006-03-01', 
    signatureVersion: "v3"
});

// orders in JSON file for simplicity, store in a db for production applications
//let orders = require('../data/orders.json');

const params = {
    Bucket: bucket,
    Key: 'orders.json'
};

const command = new GetObjectCommand(params);
const response = await client.send(command);
const ordersString = await response.Body.transformToString();
const orders = JSON.parse(ordersString);

console.log(`Read ${orders.length} orders from S3 bucket file`);


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

async function saveData() {

    // upload to S3
    try {
        const params = {
            Bucket: bucket,
            Key: 'orders.json',
            Body: JSON.stringify(orders),
            ContentType: "application/json"
        };
    
        const command = new PutObjectCommand(params);
        const response = await client.send(command);

        console.log("Orders saved to S3 bucket!");
        console.log(response);
    } catch(e) {
        console.log(e);
    }
    
    //fs.writeFileSync('data/orders.json', JSON.stringify(orders, null, 4));
}