// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// require('dotenv').config();
// require('../db/conn'); 
// const MongoStore = require('connect-mongo'); // Import connect-mongo for session storage


// const userschema= require("../Model/userschema")// Ensure the database connection is established    

// const app = express();
// const port = 3001;

// const session = require('express-session');
// const passport = require('passport');
// const Oauth2Strategy = require('passport-google-oauth20').Strategy; 

// const clientId = process.env.GOOGLE_CLIENT_ID;
// const clientSecret = process.env.GOOGLE_CLIENT_SECRET;


// app.use(cors({
//     origin:"https://ajreactapp.vercel.app", // Adjust this to your frontend's URL
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
// }));
// app.use(express.json());


// //setup session


// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({
//     mongoUrl: process.env.DATABASE
//   })
// }));


// //setup passport
// app.use(passport.initialize());
// app.use(passport.session());


// // use passport to authenticate with Google
// passport.use(new Oauth2Strategy({
//     clientID: clientId,
//     clientSecret: clientSecret,
//     callbackURL: "https://node-server-zc4m.onrender.com/auth/google/callback",
//     scope: ['profile', 'email']
// },
// async (accessToken, refreshToken, profile, done) => {
//     console.log("Google profile:", profile); // Log the profile for debugging
//     try {
//         // Check if user already exists in the database
//         let user = await userschema.findOne({ googleId: profile.id });
        
//         if (!user) {
//             // If not, create a new user
//             user = await userschema.create({
//                 googleId: profile.id,
//                 name: profile.displayName,
//                 email: profile.emails[0].value,
//                 image: profile.photos[0].value
//             });
//         }
//         await user.save(); // Save the user to the database
//         console.log("User authenticated:", user);
        
//         return  done(null, user);
//     } catch (error) {
//         console.error("Error during authentication:", error);
//         return done(error, null);
//     }
// }

// ));

// passport.serializeUser((user, done) => {
//     done(null,user);
// })
// passport.deserializeUser((user, done) => {
//     done(null,user);
// })

// app.get("/health", (_, res) => res.send("ok"));

// app.get("/auth/google", passport.authenticate("google",{scope:["profile", "email"]}));   

// app.get("/auth/google/callback", passport.authenticate("google", {
// successRedirect: "https://ajreactapp.vercel.app/dashboard",
// failureRedirect: "https://ajreactapp.vercel.app/login"
// }));


// app.get('/login/sucess', (req, res) => {
//     if (req.isAuthenticated()) {
//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             user: req.user
//         });
//     } else {
//         res.status(400).json({
//             success: false,
//             message: "User not authenticated"
//         });
//     }
// });

// app.get('/logout', (req, res, next) => {
//     req.logout((err) => {
//         if (err) { return next(err)}
//         res.redirect("https://ajreactapp.vercel.app"); // Redirect to login page after logout
//         })
//     });



// app.post('/subscribe', (req, res) => {
//   const { email, plan } = req.body;
//   console.log("Subscription request received:", req.body);

//   // Simulate saving to DB or connecting with payment gateway
//   if (!email || !plan) {
//     return res.status(400).json({ error: 'Email and plan required' });
//   }

//   console.log(`New Subscription: ${email} chose ${plan}`);
//   return res.status(200).json({ success: true, message: "Subscription successful!" });
// });


// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
require('../db/conn');

const MongoStore = require('connect-mongo');
const userschema = require("../Model/userschema");

const session = require('express-session');
const passport = require('passport');
const Oauth2Strategy = require('passport-google-oauth20').Strategy;

const app = express();

// === CONFIG ===
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://ajreactapp.vercel.app"; // Change to your frontend
const CALLBACK_URL = process.env.CALLBACK_URL || "https://nodeserver-omega.vercel.app/auth/google/callback"; // Update after deploy

// === MIDDLEWARE ===
app.use(cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express.json());

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE
    })
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth
passport.use(new Oauth2Strategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: CALLBACK_URL,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await userschema.findOne({ googleId: profile.id });
        if (!user) {
            user = await userschema.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value
            });
        }
        await user.save();
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Routes
app.get("/health", (_, res) => res.send("ok"));

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: `${FRONTEND_URL}/dashboard`,
    failureRedirect: `${FRONTEND_URL}/login`
}));

app.get('/login/sucess', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({ success: true, message: "Login successful", user: req.user });
    } else {
        res.status(400).json({ success: false, message: "User not authenticated" });
    }
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(FRONTEND_URL);
    });
});

app.post('/subscribe', (req, res) => {
    const { email, plan } = req.body;
    if (!email || !plan) {
        return res.status(400).json({ error: 'Email and plan required' });
    }
    console.log(`New Subscription: ${email} chose ${plan}`);
    res.status(200).json({ success: true, message: "Subscription successful!" });
});

// Vercel serverless export
module.exports = app;
