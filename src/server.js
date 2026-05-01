require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs/promises");
const path = require("path");
const pdfParse = require("pdf-parse");
const { extractSkills } = require("./skills");
const { recommendJobs } = require("./recommender");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

const uploadDir = path.join(__dirname, "..", "uploads");
const upload = multer({ dest: uploadDir });

async function parseResumeFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  if (ext === ".txt") {
    return fs.readFile(filePath, "utf-8");
  }
  if (ext === ".pdf") {
    const buffer = await fs.readFile(filePath);
    const parsed = await pdfParse(buffer);
    return parsed.text || "";
  }
  throw new Error("Only .txt and .pdf resumes are supported.");
}

function buildResponse(resumeText) {
  const skills = extractSkills(resumeText);
  const jobs = recommendJobs(skills);
  return {
    extractedSkills: skills,
    recommendations: jobs
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Job recommendation API running" });
});

app.post("/api/recommend/text", (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({ error: "resumeText is required." });
    }
    const response = buildResponse(resumeText);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/recommend/upload", upload.single("resume"), async (req, res) => {
  let uploadedPath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required." });
    }

    uploadedPath = req.file.path;
    const resumeText = await parseResumeFile(uploadedPath, req.file.originalname);
    const response = buildResponse(resumeText);
    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  } finally {
    if (uploadedPath) {
      await fs.unlink(uploadedPath).catch(() => {});
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
