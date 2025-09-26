import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

function App() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(false);
  const [emaillist, setEmaillist] = useState([]);
  const [credentials, setCredentials] = useState([]);

  // 🔹 Load credentials from MongoDB Atlas
  useEffect(() => {
    axios
      .get("http://localhost:3000/credentials")
      .then((res) => {
        console.log("MongoDB Data:", res.data);
        setCredentials(res.data); // store in state
      })
      .catch((err) => {
        console.error("❌ Failed to fetch credentials:", err);
      });
  }, []);

  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetname = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetname];
      const emaillist = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const totalemail = emaillist.map((item) => item.A);
      console.log(totalemail);
      setEmaillist(totalemail);
    };

    reader.readAsBinaryString(file);
  }

  function handleMsg(e) {
    setMsg(e.target.value);
  }

  function send() {
    setStatus(true);
    axios
      .post("https://localhost:3000/sendmail", { msg: msg, emaillist: emaillist })
      .then(function (data) {
        if (data.data === true) {
          alert("✅ Email sent successfully");
        } else {
          alert("❌ Failed to send emails");
        }
        setStatus(false);
      })
      .catch(() => {
        alert("⚠️ Error sending emails");
        setStatus(false);
      });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-800 text-white text-center p-6 shadow-md">
        <h1 className="text-3xl font-bold">BulkMail</h1>
      </header>

      {/* Sub Header */}
      <div className="bg-blue-600 text-white text-center p-3">
        <p className="text-lg">We help your business send multiple emails at once 📧</p>
      </div>

      {/* Upload Section */}
      <main className="flex flex-col items-center flex-grow p-6 gap-6">
        <div className="bg-white shadow-lg rounded-xl w-full max-w-lg p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center">
            Upload Email List
          </h2>

          <textarea
            onChange={handleMsg}
            value={msg}
            placeholder="Write your email message here..."
            className="w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>

          <div className="mt-4">
            <input
              onChange={handleFile}
              type="file"
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>

          <p className="mt-3 text-gray-700 font-medium">
            Total mails in the file:{" "}
            <span className="text-blue-600 font-bold">{emaillist.length}</span>
          </p>

          <button
            onClick={send}
            disabled={status}
            className="mt-5 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300"
          >
            {status ? "Sending..." : "Send"}
          </button>

          {/* Show credentials from MongoDB */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">📌 Credentials from MongoDB:</h3>
            {credentials.length > 0 ? (
              <ul className="mt-2 text-sm text-gray-700">
                {credentials.map((cred, idx) => (
                  <li key={idx} className="border-b py-1">
                    <b>User:</b> {cred.user} | <b>Provider:</b>{" "}
                    {cred.preference?.provider || "gmail"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-500 text-sm mt-2">No credentials found.</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-800 text-white text-center py-3 mt-auto">
        <p className="text-sm">© 2025 BulkMail. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;


