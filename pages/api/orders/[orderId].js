import { ordersRepo } from "../../../utils/orders-repo";

export default async function handler(req, res) {
    if(req.method === "PUT"){
        console.log(req.body);
        ordersRepo.update(req.body.order);
        return res.status(200).json({ });
    }else if(req.method === "GET"){
        let order = ordersRepo.getById(req.query.orderId);
        return res.status(200).json(order);
    }else{
        return res.status(400).json({ msg: "HTTP Method unsupported - please use GET or PUT" });
    }
}