const mongoose = require('mongoose');


mongoose.connect('mongodb://127.0.0.1:27017/ecommerce').then(()=>{
    console.log('database connected')
}).catch((error)=>{
    console.log('database not connected');
})

// const connectDatabase=()=>{
//     mongoose.connect(process.env.DB_URI).then(()=>{
//            console.log('database connected');
//        }).catch((error)=>{
//            console.log('database not connected');
//        })
// }

// module.exports = connectDatabase;