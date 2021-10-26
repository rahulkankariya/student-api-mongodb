const mangose = require("mongoose");
const user = require("../models/studentModels");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
exports.register = async (req, res) => {
  try {
    const { error } = registerValidate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        data: error.details[0].message,
      });
    }
    let email = req.body.email.toLowerCase();
    const existingUserCount = await user.countDocuments({
      email,
    });

    if (existingUserCount > 0) {
      return res.status(400).send({
        success: false,
        message: "Email is Already Exist",
        data: null,
      });
    }

    const password = await bcrypt.hash(
      req.body.password,
      await bcrypt.genSalt()
    );
    const totalRecords = await user.countDocuments();
    const newUser = new user({
      _id: new mangose.Types.ObjectId(),
      studentId: totalRecords + 1,
      studentName: req.body.studentName,
      dateOfBirth: req.body.dateOfBirth,
      email,
      password,
      parentName: req.body.parentName,
      parentRelation: req.body.parentRelation,
      studentMobileNumber: req.body.studentMobileNumber,
      parentMobileNumber: req.body.parentMobileNumber,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      department: req.body.department,
      course: req.body.course,
      class: req.body.class,
      enrollNo: req.body.enrollNo,
      enrollDate: req.body.enrollDate,
      entry: req.body.entry,
      year: req.body.year,
      admissionNo: totalRecords + 1,
      admissionDate: req.body.admissionDate,
      status: req.body.status,
      studentStatus: req.body.studentStatus,
      otp: null,
    });

    newUser.save().then((result) => {
      res.status(200).send({
        success: true,
        message: "Student records can inserted",
        data: result,
      });
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Required Fileds Are Not Valid",
      data: error,
    });
  }
};
exports.studentUpdateProfile = async (req, res) => {
  const { error } = updateProfileValidate(req.body);

  if (error) {
    return res.status(400).send({
      success: false,
      data: error.details[0].message,
    });
  }
  try {
    const id = req.currentUser.id;
    const userProfile = await user.findOne({ _id: id });
    if (!userProfile) {
      res.status(400).send({
        success: true,
        message: "User profile not found.",
        data: null,
      });
    } else {
      const {
        studentName,
        parentName,
        parentRelation,
        address,
        dateOfBirth,
        city,
        state,
        country,
        studentMobileNumber,
        parentMobileNumber,
      } = req.body;
      let email = req.body.email.toLowerCase();
      let existingUserCount = 0;
      let checkEmail = true;
      if (!email) {
        checkEmail = false;
      } else if (email === userProfile.email) {
        checkEmail = false;
      }
      if (checkEmail) {
        existingUserCount = await user.countDocuments({
          email,
        });
      }

      if (existingUserCount > 0) {
        res.status(400).send({
          success: false,
          message: "Email already registered with other account",
          data: null,
        });
      } else {
        const updateStudentProfile = user.updateOne(
          { _id: userProfile.id },
          {
            studentName: studentName ? studentName : userProfile.studentName,
            parentName: parentName ? parentName : userProfile.parentName,
            parentRelation: parentRelation
              ? parentRelation
              : userProfile.parentRelation,
            address: address ? address : userProfile.address,
            email: email ? email : userProfile.email,
            dateOfBirth: dateOfBirth ? dateOfBirth : userProfile.dateOfBirth,
            city: city ? city : userProfile.city,
            state: state ? state : userProfile.state,
            country: country ? country : userProfile.country,
            studentMobileNumber: studentMobileNumber
              ? studentMobileNumber
              : userProfile.studentMobileNumber,
            parentMobileNumber: parentMobileNumber
              ? parentMobileNumber
              : userProfile.parentMobileNumber,
          },
          (err, data) => {
            if (err) {
              res.status(400).send({
                success:false,
                message:"Data Cannot Update",
                data:null
              })
            } else {
              res.status(200).send({
                success: true,
                message: "Data Can Updated ",
                data: updateStudentProfile._update,
              });
            }
          }
        );
      }
    }
  } catch (err) {
    res.status(400).send({
      success:false,
      message:"Data Cannot Update",
      data:null
    })
  }
};
exports.changePassword = async (req, res) => {
  const { error } = changePasswordValidate(req.body);
  if (error) {
    res.status(400).send({
      success: false,
      message: error.details[0].message,
      data: null,
    });
  } else {
    const { oldPassword } = req.body;
    const id = req.currentUser.id;
    const userData = await user.findOne({ _id: id });
    if (!userData) {
      res.status(400).send({
        success: false,
        message: "User Account is Not Exist",
        data: null,
      });
    } else {
      const passwordmatch = await bcrypt.compare(
        oldPassword,
        userData.password
      );
      if (!passwordmatch) {
        res.status(400).send({
          success: false,
          message: "Old Password is Incorrect",
          data: null,
        });
      } else {
        const newPassword = await bcrypt.hash(
          req.body.newPassword,
          await bcrypt.genSalt()
        );
        const oldandnewpasswordmatch = await bcrypt.compare(
          oldPassword,
          newPassword
        );
        if (!oldandnewpasswordmatch) {
          user.updateOne(
            { _id: userData.id },
            { password: newPassword },
            (err, data) => {
              if (err) {
                res.status(400).send({
                  success: false,
                  message: "Password Cannot Changed",
                  data: err,
                });
              } else {
                res.status(200).send({
                  success: true,
                  message: "Password Changed Successfully",
                  data: null,
                });
              }
            }
          );
        } else {
          res.status(400).send({
            success: false,
            message:
              "Your New Password is Similar to Old Password Please Try Another New Password",
            data: null,
          });
        }
      }
    }
  }
};
//joi validation used
function registerValidate(insertnewdata) {
  const schema = {
    studentName: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Student Name",
        };
      })
      .min(3)
      .max(30),
    dateOfBirth: Joi.string()
      .required()
      .min(10)
      .max(11)
      .error(() => {
        return {
          message: "Please Enter a Date of Birth ",
        };
      }),
    email: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Email ID",
        };
      })
      .regex(
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/
      )
      .error(() => {
        return {
          message: "Please Enter a Valid Email Address",
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
    parentName: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Parent  Name",
        };
      }),
    parentRelation: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Parent Relation",
        };
      }),
    studentMobileNumber: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Student Mobile Number ",
        };
      })
      .regex(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/)
      .error(() => {
        return {
          message: "Please Enter Student Mobile Number 10 Digit Mobile Number",
        };
      }),
    parentMobileNumber: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Parents Mobile Number Name",
        };
      })
      .regex(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/)
      .error(() => {
        return {
          message: "Please Enter Parents Mobile Number 10 Digit Mobile Number",
        };
      }),
    address: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Address ",
        };
      }),
    city: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a City ",
        };
      }),
    state: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a State ",
        };
      }),
    country: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Country ",
        };
      }),
    department: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Department",
        };
      }),
    course: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Course",
        };
      }),
    class: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Class",
        };
      }),
    enrollNo: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Enroll Number ",
        };
      }),
    enrollDate: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Enroll Date ",
        };
      }),
    entry: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Entry  ",
        };
      }),
    year: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Year ",
        };
      }),
    admissionDate: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Admission Date  ",
        };
      }),
    status: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Status ",
        };
      }),
  };

  return Joi.validate(insertnewdata, schema);
}
function changePasswordValidate(validData) {
  const schema = {
    oldPassword: Joi.string()
      .required()
      .error(() => {
        return {
          message: "Please Enter a Old Password",
        };
      })
      .min(8),
    newPassword: Joi.string()
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
function updateProfileValidate(validData) {
  const schema = {
    studentName: Joi.string(),
    parentName: Joi.string(),
    parentRelation: Joi.string(),
    address: Joi.string(),
    dateOfBirth: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    studentMobileNumber: Joi.string(),
    parentMobileNumber: Joi.string(),
    email: Joi.string()
      .regex(
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
      )
      .error(() => {
        return {
          message: "Please Enter a Valid Email Address",
        };
      }),
  };
  return Joi.validate(validData, schema);
}
