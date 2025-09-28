// 1. Load environment variables from .env
 

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors({
  origin: "*" // or your frontend Render domain
}));

app.use(express.json());

// 2. MongoDB connection - Use MONGODB_URI from .env
mongoose
  .connect("mongodb+srv://rajarajesh1108_db_user:123@cluster0.npfaeka.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0") 
  .then(function () {
    console.log("MongoDB connected ✅");
  })
  .catch(function (error) { // Added 'error' to the catch function for better debugging
    console.log("MongoDB connection failed ❌");
    console.error(error); // Log the actual error
  });

// Credential schema (use existing bulkmail collection)
const Credential = mongoose.model("credential", {}, "bulkmail");

// API: Send Bulk Emails
app.post("/sendmail", async function (req, res) {
  try {
    const { msg, emaillist } = req.body;

    // Get credentials from DB
    const data = await Credential.find();
    if (!data || data.length === 0) {
      // It's possible the DB connection worked, but the collection is empty.
      console.error("❌ Email credentials not found in 'bulkmail' collection.");
      return res.status(500).send(false);
    }

    // Setup nodemailer
  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // secure SSL
  secure: true,
  auth: {
    user: data[0].toJSON().user,
    pass: data[0].toJSON().pass, // MUST be Gmail App Password
  },
});


    // Send emails one by one
    for (let i = 0; i < emaillist.length; i++) {
      await transporter.sendMail({
        from: data[0].toJSON().user,
        to: emaillist[i],
        subject: "Bulk Mail Service",
        text: msg,
      });
      console.log("✅ Sent to:", emaillist[i]);
    }

    res.send(true);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.send(false);
  }
});

// Start server
app.listen(3000, function () {
  console.log("🚀 Server started on port 3000");
});





