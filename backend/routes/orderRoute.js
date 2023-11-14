const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { 
    newOrder, 
    getSingleOrder, 
    myOrder, 
    getAllOrders,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');

router.route('/order/new').post(isAuthenticated,newOrder);
router.route('/order/:id').get(isAuthenticated, getSingleOrder);
router.route('/orders/me').get(isAuthenticated, myOrder);
router.route('/admin/orders').get(isAuthenticated,authorizeRoles("admin"), getAllOrders);
router.route('/admin/order/:id')
                                .put(isAuthenticated,authorizeRoles("admin"),updateOrder)
                                .delete(isAuthenticated,authorizeRoles("admin"),deleteOrder);

module.exports = router;