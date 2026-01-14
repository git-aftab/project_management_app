import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
    path: "./.env"
})

const port = process.env.PORT || 3000

let userName = process.env.NAME
let db = process.env.db
let PORT = process.env.PORT
console.log(PORT)
console.log('name = ',userName);
console.log("db=",db)
console.log("hello world");


app.listen(port,()=>{
    console.log(`app is listenting on http://localhost:${port}`)
})