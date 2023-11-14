const Order = require('../models/orderModel');
const Product = require('../models/productModel');


exports.newOrder = async (req, res) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id
    });
    res.status(201).json({
        success:true,
        order
    });
}

//get single order
exports.getSingleOrder=async(req, res)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");
    if(!order){
        res.status(400).json('product not found');
    }
    res.status(200).json({
        success:true,
        order
    });
}

//get logged in user order
exports.myOrder=async(req, res)=>{
    const order = await Order.find({user:req.user._id});
    res.status(200).json({
        success:true,
        order
    });
}

//get all orders--admin
exports.getAllOrders=async(req, res)=>{
    const orders = await Order.find();
    let totalAmount = 0;
    orders.forEach((order)=>{
        totalAmount += order.totalPrice
    });
    res.status(200).json({
        success:true,
        totalAmount,
        orders
    });
}


async function updateStock(id,quantity){
    const product = await Product.findById(id);
    product.stock = product.stock-quantity;
    await product.save();
}
//update order status--admin
exports.updateOrder = async(req, res)=>{
    const order = await Order.findById(req.params.id);
    if(order.orderStatus==="Delivered"){
        res.status(400).json('you have already delivere this order');
    }
    order.orderItems.forEach(async order=>{
        await updateStock(order.product,order.quantity);
    });
    order.orderStatus=req.body.status;
    if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now();
    }
    await order.save();
    res.status(200).json({
        success:true
    })
}


//delete order --admin
exports.deleteOrder=async(req, res)=>{
    const order = await Order.findByIdAndDelete(req.params.id);
    if(!order){
        res.status(400).json('order not found');
    }
    res.status(200).json({
        success:true,
        message:"order delete successfully"
    });
}