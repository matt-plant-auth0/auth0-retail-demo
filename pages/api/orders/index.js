import { ordersRepo } from "../../../utils/orders-repo";

export default async function handler(req, res) {
    if(req.method === "POST"){
        console.log(req.body);
        let orderId = ordersRepo.create(req.body.order);
        return res.status(200).json({ orderId: orderId });
    }else if(req.method === "GET"){
        let orderSearchResults = ordersRepo.find(x => x.email === req.query.email);
        return res.status(200).json(orderSearchResults);
    }else{
        return res.status(400).json({ msg: "HTTP Method unsupported" });
    }
}