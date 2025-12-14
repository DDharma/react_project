"use client";
import { useState } from "react";

export function Opt() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const accountSid = "REDACTED_SID";
  const authToken = "REDACTED_TOKEN";
  const twilioWhatsAppNumber = "whatsapp:+918700879448"; // e.g. +1415XXXXXXX

  // Basic auth header
  const authHeader = "Basic " + btoa(accountSid + ":" + authToken);

  function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function sendWhatsAppMessage(to, body) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append("To", `whatsapp:${to}`);
    formData.append("From", twilioWhatsAppNumber);
    formData.append("Body", body);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Failed to send WhatsApp message");
    }

    return await response.json();
  }

  async function handleSendOtp() {
    if (!phone.match(/^\d{10}$/)) {
      setMessage({
        type: "error",
        text: "Enter valid 10-digit Indian mobile number",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const otp = generateOtp();
    const messageBody = `${otp} is your verification code. For your security, do not share this code.\nFGITO`;

    try {
      await sendWhatsAppMessage(`+91${phone}`, messageBody);
      setMessage({
        type: "success",
        text: `OTP sent via WhatsApp to +91${phone}`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Send WhatsApp OTP (Client-side)</h2>
      <input
        type="tel"
        placeholder="Enter 10-digit mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 10 }}
        disabled={loading}
      />
      <button
        onClick={handleSendOtp}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          backgroundColor: "#25D366",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Sending..." : "Send WhatsApp OTP"}
      </button>

      {message && (
        <p
          style={{
            marginTop: 15,
            color: message.type === "error" ? "red" : "green",
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
