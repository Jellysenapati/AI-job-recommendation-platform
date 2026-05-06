# AI Powered Job Recommendation Platform

This project is a Node.js + JavaScript MVP that:

- Accepts resume upload (`.txt` / `.pdf`) or pasted resume text
- Extracts candidate skills using keyword matching + NLP assistance
- Recommends relevant jobs ranked by skill-match score

## Features

- Resume upload API
- Resume text API
- Skill extraction engine
- Job recommendation engine
- Simple frontend dashboard for testing

## Tech Stack

- JavaScript
- Node.js + Express
- NLP libraries: `compromise` and `natural`
- Optional PDF parsing via `pdf-parse`

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create env file:

   ```bash
   copy .env.example .env
   ```

3. Start server:

   ```bash
   npm start
   ```

4. Open:
   [http://localhost:4000](http://localhost:4000)

## API Endpoints

- `GET /api/health`
- `POST /api/recommend/text`
  - body: `{ "resumeText": "..." }`
- `POST /api/recommend/upload`
  - form-data key: `resume` (txt/pdf)

-----------end----------------------------
