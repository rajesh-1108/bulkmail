const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(function () {
    console.log("MongoDB connected ✅");
  })
  .catch(function () {
    console.log("MongoDB connection failed ❌");
  });

// Credential schema (use existing bulkmail collection)
const Credential = mongoose.model("credential",{},"bulkmail");

// API: Send Bulk Emails
app.post("/sendmail", async function (req, res) {
  try {
    const { msg, emaillist } = req.body;

    // Get credentials from DB
    const data = await Credential.find();
    if (!data || data.length === 0) {
      return res.status(500).send(false);
    }

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("🚀 Server started on port 3000");
});
