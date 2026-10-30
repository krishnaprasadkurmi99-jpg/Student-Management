let csrfToken = "";
let setupRequired = false;

const form = document.querySelector("#auth-form");
const errorBox = document.querySelector("#auth-error");

function showAuthError(message) {
  errorBox.textContent = message;
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
    document.querySelector("#auth-eyebrow").textContent = "LET'S GET STARTED";
    document.querySelector("#auth-title").textContent = "Create your workspace";
    document.querySelector("#auth-description").textContent =
      "Set up the first administrator account to secure your student records.";
    document.querySelector("#name-field").hidden = false;
    document.querySelector("#auth-name").required = true;
    document.querySelector("#auth-password").autocomplete = "new-password";
    document.querySelector("#auth-submit").innerHTML = 'Create workspace <span>→</span>';
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.querySelector("#auth-submit");
  button.disabled = true;
  showAuthError("");
  const data = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch(setupRequired ? "/api/auth/setup" : "/api/auth/login", {
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
