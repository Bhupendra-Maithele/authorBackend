const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Article = require("../models/articleModel");
const Admin = require("../models/adminModel");
const mailService = require("../service/mailService");
const verifyService = require("../service/verifyService");
const forgetService = require("../service/forgetService");
const mailAdminService = require("../service/adminMailService");
const { default: mongoose, mongo } = require("mongoose");

//const path = require("path");
const saltRounds = 10;

router.post(
  "/register",
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Enter a valid email addres"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  (req, res) => {
    let createUser = req.body;
    // console.log("register", req.body)
    const errors = validationResult(req);
    function alphanumericString(str) {
      return /[`\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(str);
    }
    if (!errors.isEmpty()) {
      res.send(errors);
    } else if (alphanumericString(createUser.name)) {
      // let obj = {
      //   value: createUser.name,
      //   msg: "Name should not contain number & special character",
      //   param: "name",
      //   location: "body",
      // };
      // errors.errors.push(obj);
      // res.send(errors.array());
      res.send({ message: "Only characters are allowed" });
    } else {
      bcrypt.hash(createUser.password, saltRounds, (err, hash) => {
        if (err) {
          res.send({ success: false, error: err });
        } else {
          //let oneTimePassword = Math.floor(100000 + Math.random() * 900000);
          //console.log(typeof oneTimePassword, oneTimePassword);
          const newUser = new User({
            name: createUser.name,
            email: createUser.email,
            password: hash,
            //mobile: createUser.mobile,
            //token: userToken,
            //otp: oneTimePassword,
          });
          console.log("newUser Data", newUser);
          newUser.save(function (err2, result2) {
            if (err2) {
              res.send(err2);
            } else {
              let sendMail = mailService.sendMailUser(newUser);
              res.send({ success: true, registered: result2});
            }
          });
        }
      });
    }
  }
);


router.post(
  "/admin-register",
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Enter a valid email addres"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  (req, res) => {
    let createAdmin = req.body;
    const errors = validationResult(req);
    function alphanumericString(str) {
      return /[`\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(str);
    }
    if (!errors.isEmpty()) {
      res.send(errors);
    } else if (alphanumericString(createAdmin.name)) {
      res.send({ message: "Only characters are allowed" });
    } else {
      bcrypt.hash(createAdmin.password, saltRounds, (err, hash) => {
        if (err) {
          res.send({ success: false, error: err });
        } else {

          const newAdmin = new Admin({
            name: createAdmin.name,
            email: createAdmin.email,
            password: hash,

          });
          console.log("newUser Data", newAdmin);
          newAdmin.save(function (err2, result2) {
            if (err2) {
              res.send(err2);
            } else {
              let sendMail = mailService.sendMailUser(newAdmin);
              res.send(result2);
            }
          });
        }
      });
    }
  }
);



router.get("/article", (req, res) => {
  // console.log('data', req.body)
  //Article.find({},{author_name: 1, title: 1, posts: 1, date: 1, subscribers: 1}, (err, result) => {
  Article.find({visible: 'Public'}).sort({$natural:-1}).limit(10).populate('myUser')
  .then(result=> res.send({success: true, postData: result}))
  .catch(error=> res.send(error));
  // res.send('ok')

});

// router.get("/authors", (req, res) => {
//   // let authorData = req.body;
//   Article.distinct('myUser', (err, result) => {
//     if(err) {
//       res.send(err)
//     } else {
//       User.find()
//     }
//   }).populate('myUser')
//   .then(result=> res.send(result))
//   .catch(error=> res.send(error))
// });

router.get("/authors", (req, res) => {
  // let authorData = req.body;
  User.find({status: true}, (err, result) => {
    if (err) {
      res.send({ success: false, error: err });
    } else {
      res.send({ success: true, authorData: result });
    }
    // console.log("result", result)
  }
  )
});

router.get("/author-posts/:id", (req, res) => {
  let authorData = req.params;
  console.log("authorData", authorData)
  //console.log("authorData id", authorData.id)
  //Article.findOne({_id: authorData._id}, {author_name: 1, title: 1, posts: 1, date: 1, subscribers: 1} ,(err, result) => {
  Article.find(
    { myUser : authorData.id }
    // (err, result) => {
    //   if (err) {
    //     res.send(err);
    //   } else {
    //     console.log("post", result)
    //     res.send(result);
    //   }
    // }
  ).populate('myUser')
  .then(result=> res.send(result))
  .catch(error=> res.send(error))
});

router.get("/read-post/:id", (req, res) => {
  let postData = req.params;
  Article.find(
    { _id: postData.id }
  ).populate('myUser')
  .then(result=> res.send(result))
  .catch(error=> res.send(error))
});

router.get("/author-profile/:id", (req, res) => {
  let authorData = req.params;
  Article.find(
    { author_id: authorData.id }
    // ,
    // (err, result) => {
    //   if (err) {
    //     res.send(err);
    //   } else {
    //     console.log("post", result)
    //     res.send(result);
    //   }
    // }
  ).populate('myUser')
  .then(result=> res.send(result))
  .catch(error=> res.send(error))
});

router.post("/getUser/post", (req, res) => {
  let authToken = JSON.parse(req.headers.authorization);
  jwt.verify(authToken, "myUserToken", (err, result) => {
    if(err) {
      res.send(err)
    } else {
      let myId = myUser._id;
      Article.find({myId: result._id}, (err2, result2) => {
        if(err2) {
          res.send(err2)
        } else {
          res.send(result2)
        }
      } )
    }
  } )
})

router.post(
  "/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Enter a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ success: false, errror: errors });
    } else {
      let userAuth = req.body;
      User.findOne(
        //{ $and: [{ email: userAuth.email }, { status: true }] },
        { email: userAuth.email },
        (err, result) => {
          if (err) {
            res.send({ success: false, error: err });
          } else if (result == null) {
            res.send({
              success: false,
              notExist: true,
              flag: 1,
              message: "User does not exist",
              //data: result,
            });
          } else if (result.status == false) {
            res.send({
              success: false,
              status: true,
              flag: 0,
              message: "Please verify your email",
              data: result,
            });
          } else {
            bcrypt.compare(
              userAuth.password,
              result.password,
              (err2, result2) => {
                if (err2) {
                  res.send({ success: false, error: err2 });
                } else if (!result2) {
                  res.send({
                    success: false,
                    flag: 2,
                    mismatch: true,
                    error: "Incorrect password",
                  });
                } else {
                  let userToken = jwt.sign(
                    { _id: result._id, role: "user" },
                    "myUserToken"
                  );
                  User.updateOne(
                    { _id: result._id },
                    { $set: { token: userToken } },
                    (err3, result3) => {
                      if (err3) {
                        res.send({ success: false, error: err3 });
                      } else {
                        res.send({
                          log_success: true,
                          data: result3,
                          token: userToken,
                          name: result.name
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  }
);


router.post(
  "/admin-login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Enter a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ success: false, errror: errors });
    } else {
      let adminAuth = req.body;
      Admin.findOne(
        //{ $and: [{ email: userAuth.email }, { status: true }] },
        { email: adminAuth.email },
        (err, result) => {
          if (err) {
            res.send({ success: false, error: err });
          } else if (result == null) {
            res.send({
              success: false,
              notExist: true,
              flag: 1,
              message: "User does not exist",
              //data: result,
            });
          } else {
            bcrypt.compare(
              adminAuth.password,
              result.password,
              (err2, result2) => {
                if (err2) {
                  res.send({ success: false, error: err2 });
                } else if (!result2) {
                  res.send({
                    success: false,
                    flag: 2,
                    mismatch: true,
                    error: "Incorrect password",
                  });
                } else {
                  let adminToken = jwt.sign(
                    { _id: result._id, role: "admin" },
                    "myAdminToken"
                  );
                  console.log("token", adminToken)
                  Admin.updateOne(
                    { _id: result._id },
                    { $set: { token: adminToken } },
                    (err3, result3) => {
                      if (err3) {
                        res.send({ success: false, error: err3 });
                      } else {
                        res.send({
                          log_success: true,
                          data: result3,
                          token: adminToken,
                          name: result.name
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  }
);


router.post(
  "/admin/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Enter a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ success: false, error: errors });
    } else {
      let adminAuth = req.body;
      console.log("adminAuth", adminAuth.email);
      Admin.findOne(
        //{ $and: [{ email: userAuth.email }, { status: true }] },
        { email: adminAuth.email },
        (err, result) => {
          if (err) {
            res.send(err);
          } else if (result != null) {
            console.log("find admin result", result);
            bcrypt.compare(
              adminAuth.password,
              result.password,
              (err2, result2) => {
                if (err2) {
                  res.send(err2);
                } else if (!result2) {
                  res.send({
                    success: false,
                    flag: 2,
                    error: "Incorrect password",
                  });
                } else {
                  let adminToken = jwt.sign(
                    { _id: result._id, role: "admin" },
                    "CIS"
                  );
                  Admin.updateOne(
                    { _id: result._id },
                    { $set: { token: adminToken } },
                    (err3, result3) => {
                      if (err3) {
                        res.send(err3);
                      } else {
                        res.send({
                          success: true,
                          data: result3,
                          token: adminToken,
                          name: result.name
                        });
                      }
                    }
                  );
                }
              }
            );
          } else {
            res.send({
              success: false,
              flag: 1,
              message: "User does not exist",
              data: result,
            });
          }
        }
      );
    }
  }
);

router.post("/register-user/verification", (req, res) => {
  let userEmail = req.body;
  //let authToken = JSON.parse(req.headers.authorization)
  User.findOne({ email: userEmail.email }, (err, result) => {
    if (err) {
      res.send(err);
    } else if (result == null) {
      res.send({ success: false, notExist: true, message: "User does not exist" });
    } else {
      // let userOtp = Math.floor(100000 + Math.random() * 900000);
      // let userToken = jwt.sign({ email: result.email }, "CIS");
      let sendMail = verifyService.sendVerifyEmailService(result);
      if (sendMail) {
        res.send({
          success: true,
          verified: true,
          message: "Email send successfully!",
          data: result,
          mailResponse: sendMail,
        });
      } else {
        res.send({
          success: false,
          message: "Email does not send",
          data: result,
          mailResponse: sendMail,
        });
      }
    }
  });
});

router.get("/email-verification/:id", (req, res) => {
  let userData = req.params;
  //let myStatus = false;
  User.findOne({ _id: userData.id }, (err, result) => {
    if (err) {
      res.send({ success: false, error: err });
    } else if (result.status == true) {
      res.send({ success: true, already: true, message: "Email address already verified", data: result });
    } else {
      console.log("user id", userData.id);
      User.updateOne(
        { _id: userData.id },
        { $set: { status: true } },
        (err2, result2) => {
          if (err2) {
            res.send({ success: false, error: err2 });
          } else {
            //myStatus = true;
            console.log("result verify", result);
            res.send({ success: true, data: result, status: true });
          }
        }
      );
    }
  });
});

router.get("/user-email-verification/:id", (req, res) => {
  let userData = req.params;
  let myStatus = false;
  User.findOne({ _id: userData.id }, (err, result) => {
    if (err) {
      res.send({ success: false, error: err });
    } else if (result.status == true) {
      res.send({ success: true, message: "Email address already verified", data: result });
    } else {
      console.log("user id", userData.id);
      User.updateOne(
        { _id: userData.id },
        { $set: { status: true } },
        (err2, result2) => {
          if (err2) {
            res.send({ success: false, error: err2 });
          } else {
            myStatus = true;
            console.log("result verify", result);
            res.send({ success: true, data: result, status: myStatus });
          }
        }
      );
    }
  });
});

router.post("/forget-password", (req, res) => {
  let userEmail = req.body;
  User.findOne({ email: userEmail.email }, (err, result) => {
    if (err) {
      res.send({ success: false, error: err });
    } else if (result == null) {
      res.send({
        success: false,
        notExist: true,
        message: "User does not exits",
        data: result,
      });
    } else {
      let sendMail = forgetService.sendForgetMailService(result);
      if (sendMail) {
        res.send({
          success: true,
          message: "Email send successfully!",
          data: result,
          mailResponse: sendMail,
        });
      } else {
        res.send({
          success: false,
          message: "Email does not send",
          data: result,
          mailResponse: sendMail,
        });
      }
    }
  });
});

router.post("/create-password/:id", (req, res) => {
  let userInfo = req.params;
  let userPass = req.body;
  User.findOne({ _id: userInfo.id }, (err, result) => {
    if (err) {
      res.send({ success: false, error: err });
    } else {
      bcrypt.hash(userPass.password, saltRounds, (err2, hash) => {
        if (err2) {
          res.send({ success: false, error: err2 });
        } else {
          User.updateOne(
            { email: result.email },
            { $set: { password: hash } },
            (err3, result3) => {
              if (err3) {
                res.send({
                  success: false,
                  message: "Data does not update",
                  error: err3,
                });
              } else {
                res.send({
                  success: true,
                  message: "Data updated successfully!",
                  //data: result3,
                });
              }
            }
          );
        }
      });
    }
  });
});

router.get("/verify", (req, res) => {
  let authToken = req.headers.token; // for postman
  //let authToken = JSON.parse(req.headers.authorization);
  jwt.verify(authToken, "CIS", (err, result) => {
    if (err) {
      res.send({ success: false });
    } else {
      res.send(result);
    }
  });
});

module.exports = router;
