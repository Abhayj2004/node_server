const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
require('./db/conn'); 
// const mongoose = require('mongoose');
// // const bcrypt = require('bcryptjs');

const userschema= require("./Model/userschema")// Ensure the database connection is established    

const app = express();
const port = 3001;

const session = require('express-session');
const passport = require('passport');
const Oauth2Strategy = require('passport-google-oauth20').Strategy; 

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

app.use(cors({
    origin:"http://localhost:3000", // Adjust this to your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express.json());


//setup session
app.use(session({
    secret: 'bvjdfhvs6er37e837543rhvwefhfvw7',
    resave: false,  
    saveUninitialized: true
}))


//setup passport
app.use(passport.initialize());
app.use(passport.session());


// use passport to authenticate with Google
passport.use(new Oauth2Strategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: "http://localhost:3001/auth/google/callback",
    scope: ['profile', 'email']
},
async (accessToken, refreshToken, profile, done) => {
    console.log("Google profile:", profile); // Log the profile for debugging
    try {
        // Check if user already exists in the database
        let user = await userschema.findOne({ googleId: profile.id });
        
        if (!user) {
            // If not, create a new user
            user = await userschema.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value
            });
        }
        await user.save(); // Save the user to the database
        console.log("User authenticated:", user);
        
        return  done(null, user);
    } catch (error) {
        console.error("Error during authentication:", error);
        return done(error, null);
    }
}

));

passport.serializeUser((user, done) => {
    done(null,user);
})
passport.deserializeUser((user, done) => {
    done(null,user);
})

app.get("/auth/google", passport.authenticate("google",{scope:["profile", "email"]}));   

app.get("/auth/google/callback", passport.authenticate("google", {
successRedirect: "http://localhost:3000/dashboard",
failureRedirect: "http://localhost:3000/login"
}));


app.get('/login/sucess', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: req.user
        });
    } else {
        res.status(400).json({
            success: false,
            message: "User not authenticated"
        });
    }
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err)}
        res.redirect("http://localhost:3000"); // Redirect to login page after logout
        })
    });


    
// // Mongoose User model
// const User = new mongoose.model("User", new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String
// }));

// Signup route
// app.post("/signup", async (req, res) => {
//   const { name, email, password, confirmPassword } = req.body;

//   if (!name || !email || !password || !confirmPassword)
//     return res.status(400).json({ message: "All fields required" });

//   if (password !== confirmPassword)
//     return res.status(400).json({ message: "Passwords do not match" });

//   const existingUser = await User.findOne({ email });
//   if (existingUser)
//     return res.status(409).json({ message: "Email already registered" });

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const newUser = new User({
//     name,
//     email,
//     password: hashedPassword
//   });

//   try {
//     await newUser.save();
//     res.status(201).json({ message: "Signup successful" });
//   } catch (err) {
//     res.status(500).json({ message: "Error saving user" });
//   }
// });


app.get('/notifications', (req, res) => {
  res.json([
    {
      id: 1,
      title: "Level 1 Completed 🎉",
      message: "Great job! You’ve successfully completed Level 1. Keep learning!",
      type: "progress",
      date: "2025-06-28"
    },
    {
      id: 2,
      title: "New Words Added 📚",
      message: "We’ve just added 10 new signs to the Level 2 Word section. Explore now!",
      type: "update",
      date: "2025-06-27"
    },
    {
      id: 3,
      title: "Practice Reminder ⏰",
      message: "It's been 3 days since your last session. Come back and keep your streak!",
      type: "reminder",
      date: "2025-06-26"
    }
  ]);
});



app.post('/subscribe', (req, res) => {
  const { email, plan } = req.body;
  console.log("Subscription request received:", req.body);

  // Simulate saving to DB or connecting with payment gateway
  if (!email || !plan) {
    return res.status(400).json({ error: 'Email and plan required' });
  }

  console.log(`New Subscription: ${email} chose ${plan}`);
  return res.status(200).json({ success: true, message: "Subscription successful!" });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
