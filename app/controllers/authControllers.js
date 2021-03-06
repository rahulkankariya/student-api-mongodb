const mangose = require("mongoose");
const user = require("../models/studentModels");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { count } = require("../models/studentModels");
exports.login = async (req, res) => {
  const { error } = login(req.body);
  if (error) {
    return res.status(400).send({
      success: false,
      message: error.details[0].message,
      data: null,
    });
  } else {
    const { password } = req.body;
    let email = req.body.email.toLowerCase();
    const userlogin = await user.findOne({ email: email });
    if (!userlogin) {
      res.status(400).send({
        success: false,
        message: "Email is not Exist ",
        data: null,
      });
    } else {
      const passwordmatch = await bcrypt.compare(password, userlogin.password);
      if (!passwordmatch) {
        res.status(400).send({
          success: false,
          message: "The email or password your entered is incorrect",
          data: null,
        });
      } else {
        if (userlogin.status === "Active") {
          const accessToken = jwt.sign(
            { id: userlogin._id },
            process.env.ACCESS_KEY,
            { expiresIn: process.env.JWT_ACCESS_SECRET_KEY_TIME }
          );
          const refreshToken = jwt.sign(
            { id: userlogin._id },
            process.env.SECRET_KEY,
            { expiresIn: process.env.JWT_REFRESH_SECRET_KEY_TIME }
          );

          res.status(200).send({
            success: true,
            message: "Login Successfully",
            data: {
              access_token: accessToken,
              refresh_token: refreshToken,
            },
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Account is Locked",
            data: null,
          });
        }
      }
    }
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPassword(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }
    const { email } = req.body;
    const userlogin = await user.findOne({ email: email });
    if (!userlogin) {
      res.status(400).send({
        success: false,
        message: "Email does Not Exist",
        data: null,
      });
    } else {
      if (userlogin.status == "Active") {
        const min = 100000;
        const max = 999999;
        const randomNumber = Math.floor(Math.random() * (max - min)) + min;
        user.updateOne(
          { _id: userlogin.id },
          { otp: randomNumber },
          (err, data) => {
            if (err) {
              res.status(400).send({
                success: false,
                message: "Otp Cannot Generate",
                data: null,
              });
            }
          }
        );
        //email otp
        let transport = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: "rahul.kankariya171197@gmail.com",
            pass: "Rahul*171197",
          },
        });
        let mailoption = {
          from: "rahul.kankariya171197@gmail.com",
          to: userlogin.email,
          subject: "OTP WILL SEND ON RAHUL KANKARIYA PRACTICE",
          html: `Use Otp  <b> ${randomNumber}</b> For login in Your Rahul Kankariya Practice Account`,
        };
        transport.sendMail(mailoption, (error, info) => {
          if (error) {
            res.status(400).send({
              success: false,
              message: "Eamil id Cannot be Found",
              data: err,
            });
          }
        });
        res.status(200).send({
          success: true,
          message:
            "We have send one time password to your registered email address",
          data: {
            userId: userlogin.id,
          },
        });
      } else {
        res.status(400).send({
          success: false,
          message: "Accout is Locked",
          data: null,
        });
      }
    }
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Otp not Generated",
      data: err,
    });
  }
};
exports.validateOtp = async (req, res) => {
  const { Otp, id } = req.body;
  const { error } = validOtp(req.body);
  if (error) {
    return res.status(400).send({
      success: false,
      message: error.details[0].message,
      data: null,
    });
  }
  
  const userValidOtp = await user.findOne({ _id: id, otp: Otp });
  if (!userValidOtp) {
    res.status(400).send({
      success: false,
      message: "Invalid OTP Enterd",
      data: null,
    });
  } else {
    res.status(200).send({
      success: true,
      message: "Otp is Correct",
      data: userValidOtp._id,
    });
  }
};
exports.resetPassword = async (req, res) => {
  const { error } = resetPassword(req.body);
  if (error) {
    return res.status(400).send({
      success: false,
      message: error.details[0].message,
      data: null,
    });
  } else {
    const id = req.body.id;
    const password = await bcrypt.hash(
      req.body.password,
      await bcrypt.genSalt()
    );
    const userresetPassword = await user.findOne({ _id: id });
    if (!userresetPassword) {
      res.status(400).send({
        success: false,
        message: "Invalid OTP Enterd",
        data: null,
      });
    } else {
      user.updateOne(
        { _id: userresetPassword.id },
        { password: password },
        (err, data) => {
          if (err) {
            res.status(200).send({
              success: false,
              message: "PassWord Cannot Changed",
              data: err,
            });
          } else {
            res.status(200).send({
              success: true,
              message: "Password Can Changed Successfully",
              data: null,
            });
          }
        }
      );
    }
  }
};
exports.refreshToken = async (req, res) => {
  const { refreshtoken } = req.body;
  try {
    if (!refreshtoken) {
      res.status(200).send({
        success: false,
        message: "Token are Not Enterd",
        data: null,
      });
    } else {
      const decoded = jwt.verify(refreshtoken, process.env.SECRET_KEY);

      const { id } = decoded;
      const accessToken = jwt.sign({ id: id }, process.env.ACCESS_KEY, {
        expiresIn: process.env.JWT_ACCESS_SECRET_KEY_TIME,
      });
      const refreshToken = jwt.sign({ id: id }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_REFRESH_SECRET_KEY_TIME,
      });
      res.status(400).send({
        success: true,
        message: "New Generte Token",
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: "Session is Expired",
      data: err,
    });
  }
};

//validation on joi packages used
function login(validData) {     
  const schema = {
    email: Joi.string()
      .email()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Email",
        };
      })
      .email({ tlds: { allow: false } })
      .error(() => {
        return {
          message: "Please Enter a Valid Email Address",
        };
      }),
    password: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Password",
        };
      }),
  };
  return Joi.validate(validData, schema);
}
function forgotPassword(validData) {
  const schema = {
    email: Joi.string()

      .required()
      .error(() => {
        return {
          message: "Please Enter a Email",
        };
      })
      .email({ tlds: { allow: false } })
      .error(() => {
        return {
          message: "Please Enter a Valid Email Address",
        };
      }),
  };
  return Joi.validate(validData, schema);
}
function resetPassword(validData) {
  const schema = {
    id: Joi.string()
      .required()
      .required()
      .error(() => {
        return {
          message: "Please Enter a  ID",
        };
      }),
    password: Joi.string()
      .required()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/
      )
      .error(() => {
        return {
          message:
            "Your Password Should be 8 charcters It should have atleast one upper case charater, one lower case charater, one number and one special symbol (* and #)",
        };
      }),
  };
  return Joi.validate(validData, schema);
}
function validOtp(validData) {
  const schema = {
    id: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a  ID",
        };
      }),
    Otp: Joi.string().required()  .error(() => {
      return {
        message: "Please Enter a Valid OTP",
      };
    })
  };
  return Joi.validate(validData, schema);
}
