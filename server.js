import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage });

/** Select which provider to use */
const PROVIDER = process.env.PROVIDER || "openai"; // "openai" | "gemini" | "deepseek"

// Initialize OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Initialize Gemini
let gemini = null;
if (process.env.GEMINI_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Analyze endpoint
app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const base64Image = req.file.buffer.toString("base64");
    const mime = req.file.mimetype;

    let analysis = "";

    if (PROVIDER === "openai" && openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this image in detail with tags." },
              {
                type: "image_url",
                image_url: `data:${mime};base64,${base64Image}`
              }
            ]
          }
        ]
      });
      analysis = response.choices[0].message.content;
    }

    else if (PROVIDER === "gemini" && gemini) {
      const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        "Describe this image in detail with tags.",
        { inlineData: { data: base64Image, mimeType: mime } }
      ]);
      analysis = result.response.text();
    }

    else if (PROVIDER === "deepseek" && process.env.DEEPSEEK_API_KEY) {
      // Example DeepSeek API call (pseudo, since SDK may differ)
      const resp = await fetch("https://api.deepseek.com/v1/vision", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-vision",
          input: [
            { role: "user", content: "Describe this image in detail with tags." },
            { role: "user", content: `data:${mime};base64,${base64Image}` }
          ]
        })
      });
      const data = await resp.json();
      analysis = data.output || "No output";
    }

    else {
      analysis = "⚠️ No valid API key or provider configured.";
    }

    res.json({ analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.listen(port, () =>
  console.log(`✅ Running on http://localhost:${port} (Provider: ${PROVIDER})`)
);
