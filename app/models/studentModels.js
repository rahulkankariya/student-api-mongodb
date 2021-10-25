
const jwt = require('jsonwebtoken');
const mangoose = require("mongoose");
const userscheme = new mangoose.Schema(

  {
    _id: mangoose.Schema.Types.ObjectId,
    studentId: {
      type: String,
      unique: true,
    },
    studentName: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    email: {
      unique: true,
      type: String,
    },
    password: {
      type: String,
    },
    parentName: {
      type: String,
    },
    parentRelation: {
      type: String,
    },
    studentMobileNumber: {
      type: String,
    },
    parentMobileNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    department: {
      type: String,
    },
    course: {
      type: String,
    },
    class: {
      type: String,
    },
    enrollNo: {
      type: String,
    },
    enrollDate: {
      type: String,
    },
    year: {
      type: String,
    },
    admissionNo: {
      type: String,
    },
    admissionDate: {
      type: String,
    },
    status: {
      type: String,
    },
    studentStatus: {
      type: String,
    },
    otp: {
      type: String,
    } 
  },
  {
    versionKey: false,
  }
);

module.exports = mangoose.model("user", userscheme);
