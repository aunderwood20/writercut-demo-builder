import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL = "https://disxgrpmcupyjnryyxbr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mNX3IKW1cjkFEwb_ily9dg_fXXiKiy_";
const API_URL = `${SUPABASE_URL}/functions/v1/demo-builder-api`;
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (selector) => document.querySelector(selector);
const authShell = $("#authShell");
const workspace = $("#workspace");
const signOutButton = $("#signOutButton");
const loginForm = $("#loginForm");
const demoForm = $("#demoForm");
const generateButton = $("#generateButton");
let session = null;
let creditBalance = 0;

function message(node, text, error = false) {
  node.textContent = text;
  node.classList.toggle("error", error);
}

async function api(action, data = {}) {
  if (!session?.access_token) throw new Error("Please sign in again.");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ action, ...data }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "WriterCut could not complete that request.");
  return payload;
}

function setAuthState(nextSession) {
  session = nextSession;
  const loggedIn = Boolean(session);
  authShell.hidden = loggedIn;
  workspace.hidden = !loggedIn;
  signOutButton.hidden = !loggedIn;
  if (loggedIn) loadAccount();
}

async function loadAccount() {
  try {
    const data = await api("account");
    creditBalance = data.balance || 0;
    $("#creditBalance").textContent = creditBalance;
    renderDemos(data.generations || []);
    updateGenerateButton();
  } catch (error) {
    message($("#demoMessage"), error.message, true);
  }
}

function renderDemos(generations) {
  const list = $("#demoList");
  if (!generations.length) {
    list.innerHTML = '<p class="empty">No demos yet. Your finished tracks will appear here.</p>';
    return;
  }
  list.replaceChildren(...generations.map((item) => {
    const article = document.createElement("article");
    article.className = "demo-item";
    const title = document.createElement("strong");
    title.textContent = item.title;
    const meta = document.createElement("small");
    meta.textContent = `${item.status.toUpperCase()} · ${Math.floor(item.duration_seconds / 60)}:${String(item.duration_seconds % 60).padStart(2, "0")} · AI-assisted demo`;
    article.append(title, meta);
    if (item.signed_url) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = item.signed_url;
      article.append(audio);
    }
    return article;
  }));
}

function updateGenerateButton() {
  const valid = demoForm.checkValidity();
  generateButton.disabled = !(valid && creditBalance > 0);
  generateButton.textContent = creditBalance > 0 ? "Generate my demo · 1 credit" : "Get a credit to generate";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = loginForm.querySelector("button");
  submit.disabled = true;
  message($("#loginMessage"), "Signing in…");
  const form = new FormData(loginForm);
  const { data, error } = await supabase.auth.signInWithPassword({ email: form.get("email"), password: form.get("password") });
  submit.disabled = false;
  if (error) return message($("#loginMessage"), error.message, true);
  message($("#loginMessage"), "");
  setAuthState(data.session);
});

signOutButton.addEventListener("click", async () => { await supabase.auth.signOut(); setAuthState(null); });
$("#jumpToCredits").addEventListener("click", () => $("#credits").scrollIntoView({ behavior: "smooth" }));

for (const [id, output, max] of [["lyrics", "lyricsCount", 3000], ["melodyDirection", "directionCount", 1200]]) {
  $(`#${id}`).addEventListener("input", (event) => { $(`#${output}`).textContent = `${event.target.value.length.toLocaleString()} / ${max.toLocaleString()}`; });
}
demoForm.addEventListener("input", updateGenerateButton);

demoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!demoForm.reportValidity()) return;
  generateButton.disabled = true;
  message($("#demoMessage"), "Submitting your protected demo request…");
  const raw = Object.fromEntries(new FormData(demoForm));
  const payload = {
    clientRequestId: crypto.randomUUID(), title: raw.title, lyrics: raw.lyrics,
    melodyDirection: raw.melodyDirection, genre: raw.genre, mood: raw.mood,
    tempo: raw.tempo, vocalType: raw.vocalType, durationSeconds: Number(raw.durationSeconds),
    coWriters: raw.coWriters || "", explicitContent: Boolean(raw.explicitContent),
    sensitiveThemes: Boolean(raw.sensitiveThemes), sensitiveThemeTypes: raw.sensitiveThemeTypes || "",
    legalNameSignature: raw.legalNameSignature,
    ownsInputsCertified: Boolean(raw.ownsInputsCertified), coWriterAuthorityCertified: Boolean(raw.coWriterAuthorityCertified),
    noInfringementCertified: Boolean(raw.noInfringementCertified), noImpersonationCertified: Boolean(raw.noImpersonationCertified),
    acceptableUseCertified: Boolean(raw.acceptableUseCertified), aiDisclosureAccepted: Boolean(raw.aiDisclosureAccepted),
  };
  try {
    const data = await api("generate", { demo: payload });
    message($("#demoMessage"), data.message || "Your demo is being generated.");
    await loadAccount();
  } catch (error) {
    message($("#demoMessage"), error.message, true);
    updateGenerateButton();
  }
});

document.querySelectorAll(".checkout").forEach((button) => button.addEventListener("click", async () => {
  button.disabled = true;
  try {
    const data = await api("checkout", { packageCode: button.dataset.package });
    window.location.assign(data.url);
  } catch (error) {
    message($("#demoMessage"), error.message, true);
    $("#demoForm").scrollIntoView({ behavior: "smooth" });
    button.disabled = false;
  }
}));

const { data: { session: initialSession } } = await supabase.auth.getSession();
setAuthState(initialSession);
supabase.auth.onAuthStateChange((_event, nextSession) => setAuthState(nextSession));
