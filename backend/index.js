const express =require("express");
const cors=require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ======================
// 1. MongoDB Connection
// ======================
mongoose
  .connect("mongodb+srv://rajarajesh1108_db_user:DI2tIf3PEpw2XLef@cluster0.npfaeka.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ======================
// 2. Define Schema + Model
// ======================
const credentialSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    pass: { type: String, required: true },
    preference: {
      provider: { type: String, default: "gmail" },
      active: { type: Boolean, default: true },
      limitPerDay: { type: Number, default: 100 },
    },
  },
  { collection: "bulkmail" } // use existing collection
);

const Credential = mongoose.model("Credential", credentialSchema);

// ======================
// 3. Routes
// ======================

// Add credential (insert into Atlas)
app.post("/add-credential", async (req, res) => {
  try {
    const { user, pass, preference } = req.body;
    const newCred = new Credential({ user, pass, preference });
    await newCred.save();
    res.json({ success: true, message: "✅ Credential saved to Atlas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "❌ Failed to save" });
  }
});

// Get all credentials
app.get("/credentials", async (req, res) => {
  try {
    const creds = await Credential.find();
    res.json(creds);
  } catch (err) {
    console.error("❌ Failed to fetch credentials:", err);
    res.status(500).json({ error: "Failed to fetch credentials" });
  }
});

// Send bulk email
app.post("/sendmail", async (req, res) => {
  try {
    const { msg, emaillist } = req.body;

    // Fetch first active credential
    const data = await Credential.findOne({ "preference.active": true });
    if (!data) return res.status(500).send("❌ No credentials found");

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: data.user,
        pass: data.pass, // ⚠️ must be Gmail App Password
      },
    });

    // Send mails
    for (let email of emaillist) {
      await transporter.sendMail({
        from: data.user,
        to: email,
        subject: "Bulk Mail Service",
        text: msg,
      });
      console.log("✅ Sent to:", email);
    }

    res.json({ success: true, message: "✅ Emails sent successfully" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ success: false, message: "❌ Failed to send" });
  }
});

// ======================
// 4. Start Server
// ======================
app.listen(3000, () => {
  console.log("🚀 Server running at https://localhost:3000");
});



