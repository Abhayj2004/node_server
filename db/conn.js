// const mongoose = require('mongoose');
// const DB = process.env.DATABASE;

// mongoose.connect(DB,{
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
// })
// .then( ()=>console.log("Connection Successful"))
// .catch((err)=>console.log("No Connection error occurs :", err));

const mongoose = require('mongoose');
const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));
