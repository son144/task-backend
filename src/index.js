// require('dotenv').config({path:"/.env"})
import dotenv from "dotenv"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDb from "./db/index.js";
import {app} from './app.js'






dotenv.config({
    path:"./.env"
})
app.get('/', (req, res) => {
    res.send('Hello World!')
})
const jokes=[{id:1,title:"a joke",content:"this is first joke"},
{id:2,title:"a joke",content:"this is second joke"},
{id:3,title:"a joke",content:"this is third joke"},
{id:4,title:"a joke",content:"this is fourth joke"},
{id:5,title:"a joke",content:"this is fifth joke"}]

app.get("/api/jokes",(req,res)=>{
    res.send(jokes)
})
connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("hii");
        console.log(`SERVER Is RUNNING AT PORT : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log(`mongo db connection failed ${error}`);
})



// import dotenv from "dotenv"
// import connectDB from "./db/index.js";
// import {app} from './app.js'
// dotenv.config({
//     path: './.env'
// })



// connectDB()
// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO db connection failed !!! ", err);
// })