const dotnnev= require('dotenv').config()
const express = require("express");
const maangose = require("mongoose");
const bcrypt = require('bcryptjs');
const app = express();
app.use(express.json()); 
// app.use(express.urlencoded({ extended: true }));  
const {mangose} = require("./app/config/db");
// simple route
require('./app/routes/studentRoutes')(app);
// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});