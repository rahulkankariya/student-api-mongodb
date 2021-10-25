const express= require('express');
const app =express();
const mangoose = require('mongoose');
module.exports = mangoose
  .connect(
    "mongodb+srv://root:Rahul@cluster0.9jyuj.mongodb.net/Student_details?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.warn("DB CONNECTION DONE");
  });