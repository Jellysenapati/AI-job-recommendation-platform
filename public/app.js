const uploadForm = document.getElementById("uploadForm");
const textForm = document.getElementById("textForm");
const statusEl = document.getElementById("status");
const skillsEl = document.getElementById("skills");
const jobsEl = document.getElementById("jobs");
const uploadButton = document.getElementById("uploadButton");
const textButton = document.getElementById("textButton");
const themeToggle = document.getElementById("themeToggle");
const toastContainer = document.getElementById("toastContainer");
const THEME_KEY = "job-platform-theme";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const UIComponents = {
  sectionHeading(title) {
    return `<h3 class="section-heading">${escapeHtml(title)}</h3>`;
  },
  emptyState(message) {
    return `<p class="empty-state">${escapeHtml(message)}</p>`;
  },
  skills(skills) {
    if (!skills.length) return this.emptyState("No recognizable skills were found in this resume.");
    return `<div class="skills-grid">${skills
      .map((skill) => `<span class="pill">${escapeHtml(skill)}</span>`)
      .join("")}</div>`;
  },
  jobs(jobs) {
    if (!jobs.length) return this.emptyState("No recommendations available yet.");
    return `<div class="jobs-list">${jobs
      .map(
        (job) => `
          <article class="job">
            <div class="job-headline">
              <div>
                <h4 class="job-title">${escapeHtml(job.title)}</h4>
                <p class="job-company">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</p>
              </div>
              <span class="score">${Number(job.matchScore) || 0}% match</span>
            </div>
            <p class="job-description">${escapeHtml(job.description)}</p>
            <p class="job-meta">Required skills: ${(job.skills || [])
              .map((skill) => escapeHtml(skill))
              .join(", ")}</p>
          </article>
        `
      )
      .join("")}</div>`;
  },
  skeletonJobs() {
    return `
      <div class="jobs-list">
        <div class="skeleton-card">
          <div class="skeleton-block short"></div>
          <div class="skeleton-block"></div>
          <div class="skeleton-block"></div>
          <div class="skeleton-block short"></div>
        </div>
        <div class="skeleton-card">
          <div class="skeleton-block short"></div>
          <div class="skeleton-block"></div>
          <div class="skeleton-block"></div>
          <div class="skeleton-block short"></div>
        </div>
      </div>
    `;
  }
};

function renderResults(data) {
  const skills = data.extractedSkills || [];
  const jobs = data.recommendations || [];

  skillsEl.innerHTML = `${UIComponents.sectionHeading("Extracted Skills")}${UIComponents.skills(skills)}`;
  jobsEl.innerHTML = `${UIComponents.sectionHeading("Recommended Jobs")}${UIComponents.jobs(jobs)}`;
}

function renderLoadingSkeleton() {
  skillsEl.innerHTML = `${UIComponents.sectionHeading("Extracted Skills")}${UIComponents.skeletonJobs()}`;
  jobsEl.innerHTML = `${UIComponents.sectionHeading("Recommended Jobs")}${UIComponents.skeletonJobs()}`;
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-6px)";
    toast.style.transition = "all 0.2s ease";
    setTimeout(() => toast.remove(), 200);
  }, 2800);
}

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.classList.remove("error", "success");
  if (type === "error") statusEl.classList.add("error");
  if (type === "success") statusEl.classList.add("success");
}

function setLoadingState(isLoading, buttonEl, loadingLabel, defaultLabel) {
  buttonEl.disabled = isLoading;
  buttonEl.textContent = isLoading ? loadingLabel : defaultLabel;
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (systemDark ? "dark" : "light");
  applyTheme(theme);
}

async function fetchRecommendations(url, options, activeButton, loadingLabel, defaultLabel) {
  setLoadingState(true, activeButton, loadingLabel, defaultLabel);
  setStatus("Analyzing resume...", "info");
  renderLoadingSkeleton();

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    renderResults(data);
    setStatus("Recommendations generated successfully.", "success");
    showToast("Recommendations ready", "success");
  } catch (error) {
    setStatus(error.message, "error");
    showToast(error.message, "error");
  } finally {
    setLoadingState(false, activeButton, loadingLabel, defaultLabel);
  }
}

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fileInput = document.getElementById("resumeFile");
  const file = fileInput.files[0];
  if (!file) {
    setStatus("Please choose a resume file first.", "error");
    showToast("Please choose a file first", "error");
    return;
  }

  const formData = new FormData();
  formData.append("resume", file);

  await fetchRecommendations("/api/recommend/upload", {
    method: "POST",
    body: formData
  }, uploadButton, "Uploading...", "Get Recommendations");
});

textForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const resumeText = document.getElementById("resumeText").value.trim();
  if (!resumeText) {
    setStatus("Please paste resume text before analyzing.", "error");
    showToast("Resume text is required", "error");
    return;
  }

  await fetchRecommendations("/api/recommend/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText })
  }, textButton, "Analyzing...", "Analyze Resume Text");
});

themeToggle.addEventListener("click", () => {
  const darkEnabled = document.body.classList.contains("theme-dark");
  const nextTheme = darkEnabled ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
  showToast(`${nextTheme === "dark" ? "Dark" : "Light"} mode enabled`, "info");
});

initTheme();
