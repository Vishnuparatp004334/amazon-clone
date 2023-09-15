const mongoose = require("mongoose");
const DB = "mongodb://127.0.0.1:27017/amazon"
mongoose.set('strictQuery', true);
mongoose.connect(DB)
.then( ()=> console.log("connection successfull..."))
.catch((err) => console.log("no connection"));