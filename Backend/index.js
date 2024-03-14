const express = require("express");
const app = express();
const path = require("path");
require("./db/db.js");
const Register = require("./models/user.js");
const nodemailer = require("nodemailer");

const port = process.env.PORT || 5000;
let enteredEmail;

// Generate a random 6-digit number
function generateRandomSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

const frontendPath = path.join(__dirname, '../frontend');

app.use(express.static(frontendPath));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(frontendPath));

// Middleware function to serve CSS files with the correct MIME type
app.get('*.css', (req, res, next) => {
    res.set('Content-Type', 'text/css');
    next();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "Landingpage", "landing.html"));
});

app.get("/login", (req,res)=>{
    res.sendFile(path.join(frontendPath, "SignUp" , "signup.html"))
})

app.get("/register", (req, res) => {
    res.sendFile(path.join(frontendPath, "SignUp", "login.html"));
});

app.get("/newpass", (req,res) =>{
    res.sendFile(path.join(frontendPath, "Login" ,"resetPassword.html"))
})

app.post("/register", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({ email: email });

        if (useremail && useremail.password==password) {
        res.send("Thank you for logging in, Log in was successful");
        } else {
        res.send("password is not matching");
        }
    } catch (e) {
        res.status(400).send(e);
    }
    });

app.post("/login", async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const confirmpass = req.body.confirmpass;
      const checkMail = await Register.findOne({ email: email });
  
      if (!checkMail) {
        if (password === confirmpass) {
          const registerUser = new Register({
            email: req.body.email,
            password: req.body.password,
            confirm_password: req.body.confirmpass,
          });
          const registered = await registerUser.save();
          res.status(200).json({ message: "Signup Successful" });
        } else {
          res.status(400).json({ error: "The passwords are not matching, please re-enter them" });
        }
      } else {
        res.status(400).json({ error: "Email already exists" });
      }
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });


app.get("/reset", (req, res) => {
    res.sendFile(path.join(frontendPath, "Login", "email.html"));
});

app.post("/reset", async (req, res) => {
    try {
        const reqemail = req.body.email;
        const useremail = await Register.findOne({ email: reqemail });

        if (useremail) {
            res.redirect("/pin");
        } else {
            res.send("Email does not exist. Please try an Email which already exists");
        }
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get("/pin", (req, res) => {
    res.sendFile(path.join(frontendPath, "Login", "OTP.html"));
});

let verificationCode;

app.post("/pin", async (req, res) => {
    try {
        enteredEmail = req.body.email;
        const useremail = await Register.findOne({ email: enteredEmail });

        if (useremail) {
            verificationCode = generateRandomSixDigitNumber();
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "mailer9909@gmail.com",
                    pass: "teuw rvlj fxiy mehs"
                },
            });
            let details = {
                from: "mailer9909@gmail.com",
                to: enteredEmail,
                subject: "Validation",
                text: "Your validation code is " + verificationCode + "."
            };

            transporter.sendMail(details, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.sendFile(path.join(frontendPath, "Login" , "OTP.html"));
                    console.log("Email has been sent");
                }
            });
        } else {
            res.send("Invalid Email, Email does not exist");
        }
    } catch (e) {
        res.status(400).send(e);
    }
});

app.post('/newpass', (req, res) => {
    try {
        const verifyCode = req.body.sixpin;

        if (verifyCode == verificationCode) {
            console.log(enteredEmail);
            console.log("correct pin");
            res.sendFile(path.join(frontendPath, "Login", "resetPassword.html"));
        } else {
            console.log("Invalid Pin");
            res.send("Invalid Pin");
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/success', async (req, res) => {
    try {
        entPass = req.body.newpassword;
        entConPass = req.body.confirmpassword;

        if (entPass == entConPass) {
            const user = await Register.findOne({ email: enteredEmail });
            if (user) {
                user.password = entPass;
                res.send("Your password has been successfully reset");
                await user.save();
            } else {
                res.send("User does not exist");
            }
        } else {
            res.send("Password and Confirm Password does not match");
        }
    } catch (e) {
        console.log(e);
    }
});

app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}`);
});