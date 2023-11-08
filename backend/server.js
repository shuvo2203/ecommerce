const app = require('./app');
const dotenv = require('dotenv');
const database = require('./config/database');
// const connectDatabase = require('./config/database');

//config
dotenv.config({path:'config/config.env'});

//connecting database
// connectDatabase();

app.listen(process.env.PORT, ()=>{
    console.log(`server running on ${process.env.PORT}`);
})