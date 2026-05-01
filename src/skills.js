const nlp = require("compromise");

const SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "node.js",
  "node",
  "react",
  "next.js",
  "express",
  "mongodb",
  "mysql",
  "postgresql",
  "python",
  "java",
  "c++",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "git",
  "rest api",
  "graphql",
  "html",
  "css",
  "tailwind",
  "redux",
  "machine learning",
  "nlp",
  "tensorflow",
  "pandas"
];

function normalizeText(text) {
  return (text || "").toLowerCase();
}

function canonicalSkill(skill) {
  if (skill === "node") return "node.js";
  return skill;
}

function extractSkills(text) {
  const lower = normalizeText(text);
  const found = new Set();

  for (const skill of SKILL_KEYWORDS) {
    if (lower.includes(skill)) {
      found.add(canonicalSkill(skill));
    }
  }

  // Extra noun extraction for candidate role hints.
  const doc = nlp(text || "");
  const nouns = doc.nouns().out("array").map((n) => n.toLowerCase().trim());
  for (const noun of nouns) {
    if (SKILL_KEYWORDS.includes(noun)) {
      found.add(canonicalSkill(noun));
    }
  }

  return Array.from(found).sort();
}

function scoreSkillMatch(candidateSkills, jobSkills) {
  const normalizedCandidate = new Set(candidateSkills.map((s) => s.toLowerCase()));
  let matched = 0;

  for (const skill of jobSkills) {
    if (normalizedCandidate.has(skill.toLowerCase())) {
      matched += 1;
    }
  }

  const score = jobSkills.length === 0 ? 0 : (matched / jobSkills.length) * 100;
  return {
    matched,
    total: jobSkills.length,
    score: Math.round(score)
  };
}

module.exports = {
  extractSkills,
  scoreSkillMatch
};
