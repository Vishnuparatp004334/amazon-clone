require("dotenv").config();
const express = require("express");
const app = express();
require("./db/conn")
const mongoose = require("mongoose")
const port = process.env.PORT || 5007;
const cookieParser = require("cookie-parser");
const DefaultData = require("./defaultdata");
const router = require("./routes/router");
// const products = require("./models/productsSchema");
// const jwt = require("jsonwebtoken");


app.use(cookieParser(""));
app.use(express.json());
app.use(router);

app.listen(port, ()=>{
    console.log(`your server is running on port ${port}`);
})

DefaultData();