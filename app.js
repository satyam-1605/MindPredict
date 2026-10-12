"use strict";

/* ------------------------------------------------------------------
   Configuration
------------------------------------------------------------------- */
const API_BASE_URL = "http://127.0.0.1:8000";
const PREDICT_URL = `${API_BASE_URL}/predict`;
const REQUEST_TIMEOUT_MS = 20000;
const SCORE_ANIMATION_MS = 900;

/* ------------------------------------------------------------------
   Field definitions
   `name` matches the StudentData keys in main.py exactly. The order
   below is the order of the keys in the JSON request body.
   kind: "int" | "float" | "choice"
------------------------------------------------------------------- */
const FIELDS = [
  { name: "age", label: "Age", kind: "int", min: 10, max: 100 },
  { name: "gender", label: "Gender", kind: "choice" },
  { name: "country", label: "Country", kind: "choice" },
  { name: "academic_level", label: "Academic level", kind: "choice" },
  { name: "most_used_platform", label: "Most used platform", kind: "choice" },
  { name: "purpose_of_use", label: "Purpose of use", kind: "choice" },
  { name: "avg_daily_usage_hours", label: "Average daily social media use", kind: "float", min: 0, max: 24 },
  { name: "daily_unlocks", label: "Daily phone unlocks", kind: "int", min: 0 },
  { name: "study_hours", label: "Study hours", kind: "float", min: 0, max: 24 },
  { name: "physical_activity_hours", label: "Physical activity", kind: "float", min: 0, max: 24 },
  { name: "sleep_hours_per_night", label: "Sleep per night", kind: "float", min: 0, max: 24 },
  { name: "stress_level", label: "Stress level", kind: "choice" },
];

const FIELD_BY_NAME = new Map(FIELDS.map((field) => [field.name, field]));

/* ------------------------------------------------------------------
   DOM references
------------------------------------------------------------------- */
const form = document.getElementById("assessment-form");
const submitButton = document.getElementById("predict-btn");
const submitLabel = submitButton.querySelector(".btn-label");
const clearButton = document.getElementById("clear-btn");
const resetButton = document.getElementById("reset-btn");
const alertBox = document.getElementById("form-alert");
const statusLine = document.getElementById("form-status");
const resultPanel = document.getElementById("results");
const scoreBlock = document.getElementById("score-block");
const scoreValue = document.getElementById("score-value");
const scoreSr = document.getElementById("score-sr");
const payloadPreview = document.getElementById("payload-preview");
const assessmentSection = document.getElementById("assessment");
const endpointLabel = document.getElementById("api-endpoint");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let isLoading = false;
let scoreFrame = 0;

/* ------------------------------------------------------------------
   Errors raised by the API layer
------------------------------------------------------------------- */
class ApiError extends Error {
  constructor(kind, title, message, fieldErrors = {}) {
    super(message);
    this.kind = kind;
    this.title = title;
    this.fieldErrors = fieldErrors;
  }
}

/* ------------------------------------------------------------------
   Validation
------------------------------------------------------------------- */
function readRaw(name) {
  return form.elements[name].value;
}

function getControls(name) {
  return Array.from(form.querySelectorAll(`[name="${name}"]`));
}

function rangeText(field) {
  return field.max === undefined ? `${field.min} or more` : `between ${field.min} and ${field.max}`;
}

function validateField(field) {
  const raw = readRaw(field.name).trim();

  if (field.kind === "choice") {
    return raw === "" ? "Choose an option." : "";
  }

  const [control] = getControls(field.name);
  if (control.validity && control.validity.badInput) return "Enter a valid number.";
  if (raw === "") return "Enter a number.";

  const value = Number(raw);
  if (!Number.isFinite(value)) return "Enter a valid number.";
  if (field.kind === "int" && !Number.isInteger(value)) return "Use a whole number.";
  if (value < field.min || (field.max !== undefined && value > field.max)) {
    return `${field.label} must be ${rangeText(field)}.`;
  }
  return "";
}

function showFieldError(name, message) {
  const errorEl = document.getElementById(`${name}-error`);
  errorEl.textContent = message;
  errorEl.hidden = message === "";
  errorEl.closest(".field").classList.toggle("has-error", message !== "");
  getControls(name).forEach((control) => {
    control.setAttribute("aria-invalid", message === "" ? "false" : "true");
  });
}

function validateForm() {
  let firstInvalid = null;
  FIELDS.forEach((field) => {
    const message = validateField(field);
    showFieldError(field.name, message);
    if (message && !firstInvalid) firstInvalid = field;
  });
  return { valid: firstInvalid === null, firstInvalid };
}

function focusField(name) {
  const [control] = getControls(name);
  if (control) control.focus();
}

/* ------------------------------------------------------------------
   Request payload
------------------------------------------------------------------- */
function buildPayload() {
  const payload = {};
  FIELDS.forEach((field) => {
    const raw = readRaw(field.name).trim();
    payload[field.name] = field.kind === "choice" ? raw : Number(raw);
  });
  return payload;
}

/* ------------------------------------------------------------------
   API layer
------------------------------------------------------------------- */
function timeoutError() {
  return new ApiError(
    "timeout",
    "The server took too long",
    `No response within ${REQUEST_TIMEOUT_MS / 1000} seconds. Try again in a moment.`
  );
}

async function sendRequest(payload, signal) {
  try {
    return await fetch(PREDICT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw timeoutError();
    throw new ApiError(
      "network",
      "Can't reach the prediction server",
      `No response from ${API_BASE_URL}. Check that FastAPI is running (uvicorn main:app --reload) and that API_BASE_URL in js/app.js matches its address.`
    );
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw timeoutError();
    return undefined;
  }
}

function buildHttpError(status, body) {
  if (status === 422 && body && Array.isArray(body.detail)) {
    const fieldErrors = {};
    body.detail.forEach((item) => {
      const name = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : undefined;
      if (FIELD_BY_NAME.has(name)) fieldErrors[name] = item.msg;
    });
    return new ApiError(
      "validation",
      "The server rejected some values",
      "Review the highlighted fields and try again.",
      fieldErrors
    );
  }
  const detail = body && typeof body.detail === "string" ? ` ${body.detail}.` : "";
  return new ApiError(
    "http",
    "The prediction failed",
    `The server returned HTTP ${status}.${detail} Check the Uvicorn terminal for details.`
  );
}

async function parsePrediction(response) {
  const data = await readJson(response);

  if (!response.ok) throw buildHttpError(response.status, data);

  if (data === undefined) {
    throw new ApiError("invalid-json", "Unexpected response", "The server replied, but the response was not valid JSON.");
  }

  const score = data === null ? undefined : data.predicted_mental_health_score;
  if (typeof score !== "number" || !Number.isFinite(score)) {
    throw new ApiError(
      "bad-shape",
      "Unexpected response",
      "The response did not include a numeric predicted_mental_health_score."
    );
  }
  return score;
}

async function requestPrediction(payload) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await sendRequest(payload, controller.signal);
    return await parsePrediction(response);
  } finally {
    window.clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------
   UI state
------------------------------------------------------------------- */
function setPanelState(state) {
  resultPanel.dataset.state = state;
}

function setStatus(message) {
  statusLine.textContent = message;
}

function showAlert(title, message) {
  alertBox.querySelector(".alert-title").textContent = title;
  alertBox.querySelector(".alert-message").textContent = message;
  alertBox.hidden = false;
}

function hideAlert() {
  alertBox.hidden = true;
}

function setLoading(loading) {
  isLoading = loading;
  submitButton.disabled = loading;
  submitButton.classList.toggle("is-loading", loading);
  submitButton.setAttribute("aria-busy", String(loading));
  submitLabel.textContent = loading ? "Running model…" : "Predict score";
}

function animateScore(target) {
  window.cancelAnimationFrame(scoreFrame);
  const finalText = target.toFixed(2);

  if (reducedMotion.matches) {
    scoreValue.textContent = finalText;
    return;
  }

  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / SCORE_ANIMATION_MS, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    scoreValue.textContent = progress < 1 ? (target * eased).toFixed(2) : finalText;
    if (progress < 1) scoreFrame = window.requestAnimationFrame(step);
  };
  scoreFrame = window.requestAnimationFrame(step);
}

function showResult(score, payload) {
  const text = score.toFixed(2);
  scoreSr.textContent = `Predicted mental health score: ${text}`;
  payloadPreview.textContent = JSON.stringify(payload, null, 2);
  setPanelState("success");
  animateScore(score);
  setStatus("Prediction complete.");
  scoreBlock.focus({ preventScroll: true });
  resultPanel.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "nearest" });
}

function showFailure(error) {
  setPanelState("idle");
  setStatus("");

  if (!(error instanceof ApiError)) {
    console.error(error);
    showAlert("Something went wrong", "An unexpected error occurred. Open the browser console for details.");
    return;
  }

  showAlert(error.title, error.message);

  const invalidNames = Object.keys(error.fieldErrors);
  invalidNames.forEach((name) => showFieldError(name, error.fieldErrors[name]));
  if (invalidNames.length > 0) focusField(invalidNames[0]);
}

/* ------------------------------------------------------------------
   Event handlers
------------------------------------------------------------------- */
async function handleSubmit(event) {
  event.preventDefault();
  if (isLoading) return;

  hideAlert();
  setStatus("");

  const { valid, firstInvalid } = validateForm();
  if (!valid) {
    showAlert("Check your answers", "Some fields need attention before the model can run.");
    focusField(firstInvalid.name);
    return;
  }

  const payload = buildPayload();
  setLoading(true);
  setPanelState("loading");
  setStatus("Running the model…");

  try {
    const score = await requestPrediction(payload);
    showResult(score, payload);
  } catch (error) {
    showFailure(error);
  } finally {
    setLoading(false);
  }
}

function handleFieldEvent(event) {
  const field = FIELD_BY_NAME.get(event.target.name);
  if (!field) return;

  const isRadio = event.target.type === "radio";
  if (event.type === "focusout") {
    if (!isRadio) showFieldError(field.name, validateField(field));
    return;
  }

  const errorEl = document.getElementById(`${field.name}-error`);
  if (!errorEl.hidden) showFieldError(field.name, validateField(field));
}

function resetAssessment({ scroll }) {
  window.cancelAnimationFrame(scoreFrame);
  form.reset();
  FIELDS.forEach((field) => showFieldError(field.name, ""));
  hideAlert();
  setStatus("");
  setPanelState("idle");

  if (scroll) {
    assessmentSection.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
  }
  focusField(FIELDS[0].name);
}

/* ------------------------------------------------------------------
   Init
------------------------------------------------------------------- */
function init() {
  endpointLabel.textContent = PREDICT_URL;

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("input", handleFieldEvent);
  form.addEventListener("change", handleFieldEvent);
  form.addEventListener("focusout", handleFieldEvent);

  clearButton.addEventListener("click", () => resetAssessment({ scroll: false }));
  resetButton.addEventListener("click", () => resetAssessment({ scroll: true }));
}

init();