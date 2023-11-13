const Product = require('../models/productModel');
const ApiFeatures = require('../utils/apiFeatures');


//created product --Admin
exports.createProduct = async (req, res, next) => {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    });
}

//get all products
exports.getAllProducts = async (req, res) => {
    const resultPerPage = 5;
    const productCount = await Product.countDocuments()
    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter().pagination(resultPerPage);
    const products = await apiFeature.query;
    res.status(200).json({
        success: true,
        products,
        productCount
    });
}

//get single product details
exports.getProductDetails = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(500).json({
            success: false,
            message: 'product not found'
        });
    }
    res.status(200).json({
        success: true,
        product,
    });
}

//update a product --Admin
exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(500).json({
            success: false,
            message: 'product not found'
        })
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
        success: true,
        product
    });
}

//delete a product
exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(500).json({
            success: false,
            message: 'product not found'
        });
    }
    await product.deleteOne();
    res.status(200).json({
        success: true,
        message: 'product delete successfully'
    });
}


//create review and update review
exports.createProductReview = async (req, res) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(rev=>rev.user.toString()===req.user._id);

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString())
                rev.rating = rating,
                rev.comment = comment
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }
    let avg = 0;
    product.reviews.forEach((rev)=>{
        avg = avg+rev.rating
    });
    product.ratings=avg/product.reviews.length

    await product.save();
    res.status(200).json({
        success: true
    });
}

//get all reviews
exports.getProductReviews=async(req, res)=>{
    const product = await Product.findById(req.query.id);
    if(!product){
        res.status(400).json('product not found');
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews
    });
}

//delete review
exports.deleteReview=async(req, res)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
        res.status(400).json('product not found');
    }
    const reviews = product.reviews.filter(rev=>rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    reviews.forEach((rev)=>{
        avg = avg+rev.rating
    });
    const rating = avg/reviews.length;
    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        rating,
        numOfReviews
    },{
        new:true
    });

    res.status(200).json({
        success:true
    });
}