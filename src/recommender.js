const jobs = require("../data/jobs");
const { scoreSkillMatch } = require("./skills");

function recommendJobs(candidateSkills, topN = 5) {
  const ranked = jobs
    .map((job) => {
      const match = scoreSkillMatch(candidateSkills, job.skills);
      return {
        ...job,
        matchScore: match.score,
        matchedSkills: match.matched,
        totalSkills: match.total
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return ranked.slice(0, topN);
}

module.exports = {
  recommendJobs
};
