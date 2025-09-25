import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// File storage (in memory for quick processing)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve frontend
app.use(express.static("public"));

// API route: analyze image
app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const base64Image = req.file.buffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image in detail." },
            {
              type: "image_url",
              image_url: `data:image/png;base64,${base64Image}`
            }
          ]
        }
      ]
    });

    const analysis = response.choices[0].message.content;
    res.json({ analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
