import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})


let userName = process.env.name
let db = process.env.db
console.log('name = ',userName);
console.log("db=",db)
console.log("hello world");
