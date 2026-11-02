let csrfToken = "";
let setupRequired = false;
let signupMode = false;

const form = document.querySelector("#auth-form");
const errorBox = document.querySelector("#auth-error");
const nameField = document.querySelector("#name-field");
const nameInput = document.querySelector("#auth-name");
const authSwitch = document.querySelector("#auth-switch");
const authToggle = document.querySelector("#auth-toggle");

function showAuthError(message) {
  errorBox.textContent = message;
}

function setAuthMode(signup) {
  signupMode = signup;
  nameField.hidden = !signupMode;
  nameInput.required = signupMode;
  document.querySelector("#auth-eyebrow").textContent = signupMode ? "JOIN CAMPUSLY" : "WELCOME BACK";
  document.querySelector("#auth-title").textContent = signupMode ? "Create your account" : "Sign in to Campusly";
  document.querySelector("#auth-description").textContent = signupMode
    ? "Create an administrator account to access the Campusly workspace."
    : "Your student workspace is right where you left it.";
  document.querySelector("#auth-password").autocomplete = signupMode ? "new-password" : "current-password";
  document.querySelector("#auth-submit").innerHTML = signupMode
    ? 'Create account <span>→</span>'
    : 'Sign in <span>→</span>';
  authToggle.textContent = signupMode ? "Sign in" : "Create account";
  authSwitch.firstChild.textContent = signupMode ? "Already have an account? " : "Don’t have an account? ";
  document.querySelector("#auth-security").textContent = signupMode
    ? "Administrator accounts have full access to this workspace and its student records."
    : "🔒  Private workspace · Passwords are securely hashed";
  showAuthError("");
}

async function initializeAuth() {
  const response = await fetch("/api/auth/status");
  if (!response.ok) throw new Error("Could not connect to the server.");
  const state = await response.json();
  csrfToken = state.csrf_token;
  setupRequired = state.setup_required;
  if (state.authenticated) {
    window.location.replace("/");
    return;
  }
  if (setupRequired) {
    setAuthMode(true);
    document.querySelector("#auth-eyebrow").textContent = "LET'S GET STARTED";
    document.querySelector("#auth-title").textContent = "Create your workspace";
    document.querySelector("#auth-description").textContent =
      "Set up the first administrator account to secure your student records.";
    document.querySelector("#auth-submit").innerHTML = 'Create workspace <span>→</span>';
  } else {
    authSwitch.hidden = false;
    setAuthMode(false);
  }
}

authToggle.addEventListener("click", () => setAuthMode(!signupMode));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.querySelector("#auth-submit");
  button.disabled = true;
  showAuthError("");
  const data = Object.fromEntries(new FormData(form));
  try {
    const endpoint = setupRequired
      ? "/api/auth/setup"
      : signupMode ? "/api/auth/register" : "/api/auth/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not sign in.");
    window.location.replace("/");
  } catch (error) {
    showAuthError(error.message);
    button.disabled = false;
  }
});

initializeAuth().catch((error) => showAuthError(error.message));
