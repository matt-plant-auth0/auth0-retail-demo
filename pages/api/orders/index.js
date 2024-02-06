import { ordersRepo } from "../../../utils/orders-repo";

export default async function handler(req, res) {
    if(req.method === "POST"){
        console.log(req.body);
        let orderId = ordersRepo.create(req.body.order);
        return res.status(200).json({ orderId: orderId });
    }else if(req.method === "GET"){
        console.log(req.query);
        let orderSearchResults = ordersRepo.find(x => x.email === req.query.email);
        let orderIds = [];
        if(orderSearchResults && orderSearchResults.length > 0){
          orderIds = orderSearchResults.map(order => { return order.id });
        }
        return res.status(200).json({ orderIds: orderIds });
    }else{
        return res.status(400).json({ msg: "HTTP Method unsupported" });
    }
}