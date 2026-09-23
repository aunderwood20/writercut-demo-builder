import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL = "https://disxgrpmcupyjnryyxbr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mNX3IKW1cjkFEwb_ily9dg_fXXiKiy_";
const DEMO_API_URL = `${SUPABASE_URL}/functions/v1/demo-builder-api`;
const LIVE_SITE = "https://writercut.com";
const CATALOG_TOTAL = 10;
const CATALOG_TARGET = 200;
const IS_STAGING = location.hostname !== "writercut.com";
const DEMO_PURCHASES_ENABLED = false;
const DEMO_GENERATION_ENABLED = false;
const TURNSTILE_SITE_KEY = "0x4AAAAAAEqtmqnigF1D3MH4";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const app = document.querySelector("#app");
const headerActions = document.querySelector("#headerActions");
const siteNav = document.querySelector("#siteNav");
const menuToggle = document.querySelector("#menuToggle");
document.querySelector("#copyrightYear").textContent = String(new Date().getFullYear());

let session = null;
let accountCache = null;
let turnstileScriptPromise;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error("Verification did not load."));
      script.onerror = () => reject(new Error("Verification could not load. Please refresh and try again."));
      document.head.append(script);
    }).catch((error) => { turnstileScriptPromise = undefined; throw error; });
  }
  return turnstileScriptPromise;
}

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character]));

const routeInfo = () => {
  const raw = location.hash.startsWith("#/") ? location.hash.slice(1) : "/";
  const [pathname, search = ""] = raw.split("?");
  return { pathname: pathname || "/", params: new URLSearchParams(search) };
};

const go = (path) => { location.hash = path.startsWith("/") ? path : `/${path}`; };

function setTitle(title, description) {
  document.title = `${title} — WriterCut`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && description) meta.content = description;
}

function updateHeader(pathname) {
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const route = link.getAttribute("href").slice(1);
    link.classList.toggle("active", pathname === route);
  });
  headerActions.innerHTML = session
    ? `<a class="button button-ghost" href="#/profile">My songs</a><button class="button button-gold" id="signOutButton" type="button">Sign out</button>`
    : `<a class="button button-ghost" href="#/login">Sign in</a><a class="button button-gold" href="#/signup?type=writer">Join free</a>`;
  document.querySelector("#signOutButton")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    session = null;
    accountCache = null;
    go("/");
  });
}

function shellHero({ eyebrow, title, body, word = "WriterCut", actions = "" }) {
  return `<section class="page-hero" data-word="${escapeHtml(word)}"><div class="wrap"><p class="eyebrow"><span class="dot">♫</span>${eyebrow}</p><h1 class="display">${title}</h1><p class="body-large">${body}</p>${actions ? `<div class="hero-actions">${actions}</div>` : ""}</div></section>`;
}

function homePage() {
  setTitle("Where Songs Find Artists", "WriterCut gives songwriters a focused catalog and approved industry professionals a serious place to discover songs.");
  return `<div class="page">
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="eyebrow"><span class="dot">♫</span>WHERE SONGS FIND ARTISTS.</p>
          <h1 class="display"><span class="gold">Your songs</span><br>deserve more than<br><span class="outline">a hard drive.</span></h1>
          <p class="body-large">WriterCut gives serious songwriters ten focused slots—and gives approved industry professionals a catalog built for listening, not endless scrolling.</p>
          <div class="hero-actions">
            <a class="button button-gold" href="#/signup?type=writer">Upload your songs</a>
            <a class="button button-ghost" href="#/demo-builder">Build a demo</a>
          </div>
          <div class="trust-row"><span>Upload free</span><span>Keep your rights</span><span>Replace anytime</span><span>AI demos disclosed</span></div>
        </div>
        <aside class="launch-card">
          <span class="ribbon">Opening catalog</span>
          <p class="eyebrow">THE FIRST 200</p>
          <h2>Help build the catalog industry people want to hear.</h2>
          <div class="catalog-number"><strong>${CATALOG_TOTAL}</strong><span>/ ${CATALOG_TARGET}<br>songs loaded</span></div>
          <div class="catalog-meter" aria-label="${CATALOG_TOTAL} of ${CATALOG_TARGET} songs"><span></span></div>
          <ul><li>Your strongest ten complete songs</li><li>Human-written songs stay at the center</li><li>AI-assisted demos are welcome with honest disclosure</li></ul>
          <a class="button button-gold button-wide" href="#/signup?type=writer">Claim your 10 slots</a>
        </aside>
      </div>
    </section>
    <div class="piano-divider" aria-hidden="true"></div>
    <section class="statement-band"><div class="wrap"><strong>10</strong><h2>Days. 10 songs.<br>Get heard.</h2><p>No bloated profiles. No hundred-song dumps. Put your best work forward.</p></div></section>
    <section class="section"><div class="wrap">
      <div class="section-head"><div><p class="eyebrow">THE RULE OF 10</p><h2 class="section-title">Less noise.<br><span class="gold">More signal.</span></h2></div><p>WriterCut is intentionally focused. Songwriters choose their strongest work. Industry listeners get a catalog they can actually work through.</p></div>
      <div class="cards">
        <article class="card"><span class="card-number">01</span><h3>Choose your ten</h3><p>Upload up to ten complete, original songs. Replace a slot when stronger work is ready.</p></article>
        <article class="card accent"><span class="card-number">02</span><h3>Keep every right</h3><p><strong>WriterCut does not take ownership.</strong> Your rights remain yours while the catalog creates a path to discovery.</p></article>
        <article class="card"><span class="card-number">03</span><h3>Get heard</h3><p>Approved industry professionals search, listen, save favorites, and request a formal hold.</p></article>
      </div>
    </div></section>
    <section class="section section-tight"><div class="wrap split">
      <div class="visual-block"><span class="visual-note">♫</span></div>
      <div class="copy-block"><p class="eyebrow">HUMAN SONG. HONEST DEMO.</p><h2 class="section-title small">AI can help the demo.<br><span class="gold">It cannot replace the writer.</span></h2><p>Use AI for vocals, instrumentation, arrangement, production, mixing, or mastering. Just disclose it clearly. WriterCut is built around human-written lyrics and composition.</p><ul class="check-list"><li>Clear AI Demo Disclosure</li><li>No artist imitation or cloned voices</li><li>Private Demo Builder output</li><li>Rights and co-writer certifications recorded</li></ul><a class="button button-gold" href="#/demo-builder">Open Demo Builder</a></div>
    </div></section>
    <section class="section"><div class="wrap quote-panel"><p class="eyebrow">WHY WRITERCUT</p><blockquote>“The song should speak before the <span>follower count</span> does.”</blockquote></div></section>
    <section class="section-tight"><div class="wrap cta-panel"><p class="eyebrow" style="color:#080808">THE OPENING CATALOG</p><h2>Do not wait until it is full to decide you should have been in it.</h2><p>Upload free. Keep your rights. Put your strongest ten songs where the right people can find them.</p><div class="hero-actions"><a class="button button-dark" href="#/signup?type=writer">Join WriterCut</a><a class="button button-ghost" style="border-color:#080808;color:#080808" href="#/for-writers">See how it works</a></div></div></section>
  </div>`;
}

function writersPage() {
  setTitle("For Songwriters", "Upload your ten strongest original songs free, keep your rights, and be ready for industry discovery.");
  return `<div class="page">${shellHero({ eyebrow: "FOR SONGWRITERS", title: `You wrote<br><span class="gold">the song.</span>`, body: "Now give it a serious place to be heard. Upload your ten strongest complete songs free, replace them when you want, and keep every right you own.", word: "Writers", actions: `<a class="button button-gold" href="#/signup?type=writer">Join free</a><a class="button button-ghost" href="#/upload">Upload a song</a>` })}
    <section class="section"><div class="wrap"><div class="section-head"><div><p class="eyebrow">WHAT YOU GET</p><h2 class="section-title">Ten slots.<br><span class="gold">Zero clutter.</span></h2></div><p>This is a working catalog, not a storage drive. Every songwriter gets the same focused opportunity to show their best work.</p></div><div class="cards"><article class="card"><span class="card-number">$0</span><h3>Free forever</h3><p>No upload fee, listing fee, or songwriter subscription.</p></article><article class="card"><span class="card-number">10</span><h3>Your best songs</h3><p>Ten active slots force the strongest work to the front.</p></article><article class="card"><span class="card-number">100%</span><h3>Your rights</h3><p>Uploading does not transfer ownership, publishing, or master rights.</p></article></div></div></section>
    <section class="section-tight"><div class="wrap split"><div class="copy-block"><p class="eyebrow">DEMO QUALITY MATTERS</p><h2 class="section-title small">No studio?<br><span class="gold">No excuse.</span></h2><p>Bring your original lyrics and direction. The WriterCut Demo Builder can help shape a private, AI-assisted demo up to four minutes so the song can speak for itself.</p><ul class="check-list"><li>$4.99 for one demo credit</li><li>$39.99 for ten demo credits</li><li>No subscription or surprise renewal</li><li>Clear AI Demo Disclosure attached</li></ul><a class="button button-gold" href="#/demo-builder">Build your demo</a></div><div class="launch-card"><p class="eyebrow">YOUR STANDARD</p><h2>Do not upload everything.</h2><div class="catalog-number"><strong>10</strong><span>strong songs<br>beat 100 drafts</span></div><ul><li>Finished songs</li><li>Accurate credits</li><li>Honest AI disclosure</li><li>Work you are ready to stand behind</li></ul></div></div></section>
    <section class="section-tight"><div class="wrap cta-panel"><h2>Stop waiting for someone to ask.</h2><p>Build the catalog entry before opportunity arrives.</p><div class="hero-actions"><a class="button button-dark" href="#/signup?type=writer">Claim your slots</a></div></div></section>
  </div>`;
}

function industryPage() {
  setTitle("For Industry", "Discover focused songwriter catalogs, save songs, and request formal holds through WriterCut.");
  return `<div class="page">${shellHero({ eyebrow: "FOR INDUSTRY", title: `Find<br><span class="gold">the one.</span>`, body: "A focused catalog of complete songs from serious writers. Search less. Listen better. Request holds through a clear, documented process.", word: "Industry", actions: `<a class="button button-gold" href="#/signup?type=industry">Apply for access</a><a class="button button-ghost" href="#/pricing">View plans</a>` })}
    <section class="section"><div class="wrap"><div class="section-head"><div><p class="eyebrow">BUILT FOR THE WORK</p><h2 class="section-title">Not for scrolling.<br><span class="gold">For finding.</span></h2></div><p>WriterCut separates the songwriter lane from the industry lane. Professional access is reviewed before payment can open the catalog.</p></div><div class="cards"><article class="card"><span class="card-number">01</span><h3>Focused catalog</h3><p>Each writer gets only ten active slots, keeping the catalog deliberate.</p></article><article class="card accent"><span class="card-number">02</span><h3>Search and save</h3><p>Filter by genre, mood, tempo, vocal, language, and demo disclosure.</p></article><article class="card"><span class="card-number">03</span><h3>Request a hold</h3><p>Use a fixed 30-day hold workflow without implying a license or rights transfer.</p></article></div></div></section>
    <section class="section-tight"><div class="wrap quote-panel"><p class="eyebrow">FIRST 10 ACCESS</p><blockquote>Hear each new song for ten full days <span>before Pro access.</span></blockquote><div class="hero-actions"><a class="button button-gold" href="#/pricing">Compare membership</a></div></div></section>
  </div>`;
}

function howPage() {
  setTitle("The Rule of 10", "How WriterCut keeps songwriter portfolios focused and the industry catalog useful.");
  return `<div class="page">${shellHero({ eyebrow: "THE RULE OF 10", title: `Your ten<br><span class="gold">best songs.</span>`, body: "WriterCut works because the limit is the feature. Ten active slots make every choice matter and keep the catalog useful.", word: "Ten" })}
    <section class="section"><div class="wrap"><div class="steps"><article class="step-row"><h3>Create a writer account</h3><p>Verify your email, confirm you are 18 or older, and accept the account terms.</p></article><article class="step-row"><h3>Choose a slot</h3><p>Select one of ten permanent catalog positions. A new song or replacement goes into that slot.</p></article><article class="step-row"><h3>Upload and certify</h3><p>Add credits, metadata, audio, rights confirmations, co-writer authority, and AI demo disclosure.</p></article><article class="step-row"><h3>Enter the catalog</h3><p>Your song becomes discoverable according to WriterCut’s staged-access rules.</p></article><article class="step-row"><h3>Replace when ready</h3><p>Keep the slot. Change the song. Your catalog should improve as your writing improves.</p></article></div></div></section>
    <section class="section-tight"><div class="wrap cta-panel"><h2>Ten is not a restriction. It is your filter.</h2><p>The catalog gets stronger when every writer has to choose.</p><div class="hero-actions"><a class="button button-dark" href="#/signup?type=writer">Start your ten</a></div></div></section>
  </div>`;
}

function pricingPage() {
  setTitle("Pricing", "Writer uploads are free. Demo credits start at $4.99. Approved industry memberships start at $49 per month.");
  return `<div class="page">${shellHero({ eyebrow: "CLEAR PRICING", title: `Writers are free.<br><span class="gold">Tools and access are paid.</span>`, body: "No buried renewal. No songwriter listing charge. Buy optional demo credits when you need them; approved industry members pay for catalog access.", word: "Pricing" })}
    <section class="section"><div class="wrap"><div class="pricing-grid">
      <article class="price-card"><span class="price-label">Songwriter catalog</span><div class="price"><strong>$0</strong><span>forever</span></div><p>Upload and maintain your ten best songs.</p><ul class="check-list"><li>Ten active song slots</li><li>Replace songs anytime</li><li>Keep your rights</li><li>AI-assisted demos accepted with disclosure</li></ul><a class="button button-ghost button-wide" href="#/signup?type=writer">Join free</a></article>
      <article class="price-card featured"><span class="best-value">Optional tool</span><span class="price-label">Demo credits</span><div class="price"><strong>$4.99</strong><span>one demo</span></div><p>Or purchase ten credits for $39.99.</p><ul class="check-list"><li>Up to four minutes</li><li>Private output</li><li>One credit per generation</li><li>Technical failure automatically refunded</li></ul><a class="button button-gold button-wide" href="#/demo-builder">Open Demo Builder</a></article>
      <article class="price-card"><span class="price-label">Industry membership</span><div class="price"><strong>$49</strong><span>/month Pro</span></div><p>First 10 early access is $99 per month.</p><ul class="check-list"><li>Application and approval required</li><li>Search, listen, save, and request holds</li><li>First 10 gets ten-day early access</li><li>Discovery access creates no ownership</li></ul><a class="button button-ghost button-wide" href="#/signup?type=industry">Apply for access</a></article>
    </div></div></section>
  </div>`;
}

function discoverPage() {
  setTitle("Discover Songs", "WriterCut's focused discovery catalog for approved music-industry professionals.");
  const signedIn = Boolean(session);
  return `<div class="page">${shellHero({ eyebrow: "DISCOVER SONGS", title: `A catalog built<br><span class="gold">to be heard.</span>`, body: signedIn ? "Your account is connected. The full discovery filters and protected audio player remain on the live WriterCut catalog while this new design is staged." : "Catalog listening is protected. Sign in with an approved industry account to search, listen, save songs, and request holds.", word: "Discover", actions: signedIn ? `<a class="button button-gold" href="${LIVE_SITE}/discover">Open live catalog</a>` : `<a class="button button-gold" href="#/login?from=/discover">Sign in</a><a class="button button-ghost" href="#/signup?type=industry">Apply for access</a>` })}
    <section class="section"><div class="wrap"><div class="cards"><article class="card"><span class="card-number">10</span><h3>Focused portfolios</h3><p>Every writer makes a deliberate choice about what belongs in the catalog.</p></article><article class="card accent"><span class="card-number">10D</span><h3>First look</h3><p>First 10 members hear every new song during its first ten full days.</p></article><article class="card"><span class="card-number">30D</span><h3>Fixed holds</h3><p>Hold requests run for a clear 30-day term and do not transfer rights.</p></article></div></div></section>
  </div>`;
}

function loginPage(params) {
  setTitle("Sign In", "Sign in to your WriterCut songwriter or approved industry account.");
  const from = params.get("from") || "/profile";
  const verified = params.get("verified") === "1";
  return `<div class="auth-layout"><section class="auth-art"><p class="eyebrow">WELCOME BACK</p><h1>Put the song<br><span class="gold">back to work.</span></h1><p>One WriterCut account connects your song slots, catalog activity, demo credits, and private generated demos.</p></section><section class="auth-form-shell"><form class="auth-form" id="loginForm" data-from="${escapeHtml(from)}"><p class="eyebrow">ACCOUNT ACCESS</p><h2>Sign in</h2><p class="muted">Use the same email and password you use on WriterCut.</p>${verified ? `<p class="form-message success">Email verified. You can sign in now.</p>` : ""}<div class="form-grid"><div class="field"><label for="loginEmail">Email</label><input id="loginEmail" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="loginPassword">Password</label><input id="loginPassword" name="password" type="password" autocomplete="current-password" minlength="8" required></div><div class="field"><label>Human verification</label><div id="loginTurnstile"></div></div><button class="button button-gold button-wide" type="submit" disabled>Enter WriterCut</button><p class="form-message" id="loginMessage" role="status"></p></div>${IS_STAGING ? `<p class="auth-switch">Staging sign-in unavailable? <a href="${LIVE_SITE}/login">Open live sign-in</a></p>` : ""}<p class="auth-switch">Need an account? <a href="#/signup?type=writer">Join free</a></p></form></section></div>`;
}

function signupPage(params) {
  const industry = params.get("type") === "industry";
  setTitle(industry ? "Industry Application" : "Songwriter Sign Up", industry ? "Create an industry account to begin WriterCut's professional verification process." : "Create a free WriterCut songwriter account and claim your ten song slots.");
  if (IS_STAGING) {
    return `<div class="auth-layout"><section class="auth-art"><p class="eyebrow">${industry ? "INDUSTRY ACCESS" : "SONGWRITER ACCESS"}</p><h1>${industry ? `Find the song.<br><span class="gold">Before the noise.</span>` : `Ten slots.<br><span class="gold">Your strongest work.</span>`}</h1><p>${industry ? "Professional verification and membership approval come after registration." : "Upload free, keep your rights, and make your songs ready for discovery."}</p></section><section class="auth-form-shell"><div class="auth-form"><p class="eyebrow">STAGED DESIGN</p><h2>Join WriterCut</h2><p class="muted">New accounts are created on the current WriterCut site while this design is being reviewed.</p><a class="button button-gold button-wide" href="${LIVE_SITE}/signup?type=${industry ? "industry" : "writer"}">Continue to live signup</a><p class="auth-switch">Already registered? <a href="#/login">Sign in</a></p></div></section></div>`;
  }
  return `<div class="auth-layout"><section class="auth-art"><p class="eyebrow">${industry ? "INDUSTRY ACCESS" : "SONGWRITER ACCESS"}</p><h1>${industry ? `Find the song.<br><span class="gold">Before the noise.</span>` : `Ten slots.<br><span class="gold">Your strongest work.</span>`}</h1><p>${industry ? "Create the account first. Professional verification and membership approval come next." : "Upload free, keep your rights, and build a catalog entry that is ready before opportunity arrives."}</p></section><section class="auth-form-shell"><form class="auth-form" id="signupForm" data-account-type="${industry ? "industry" : "writer"}"><p class="eyebrow">CREATE ACCOUNT</p><h2>${industry ? "Industry account" : "Writer account"}</h2><div class="form-grid"><div class="field"><label for="signupName">Full legal name</label><input id="signupName" name="name" autocomplete="name" maxlength="120" required></div><div class="field"><label for="signupEmail">Email</label><input id="signupEmail" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="signupDob">Date of birth</label><input id="signupDob" name="dateOfBirth" type="date" autocomplete="bday" required><small>WriterCut accounts are limited to adults age 18 or older.</small></div><div class="field"><label for="signupPassword">Password</label><input id="signupPassword" name="password" type="password" autocomplete="new-password" minlength="8" required></div><label class="check-field"><input name="legalAccepted" type="checkbox" required><span>I am at least 18 and agree to the <a class="gold" href="#/terms">Terms</a>, <a class="gold" href="#/privacy">Privacy Policy</a>, and applicable WriterCut policies.</span></label><button class="button button-gold button-wide" type="submit">${industry ? "Create and apply" : "Claim my 10 slots"}</button><p class="form-message" id="signupMessage" role="status"></p></div><p class="auth-switch">Already registered? <a href="#/login">Sign in</a></p></form></section></div>`;
}

async function demoApi(action, data = {}) {
  if (!session?.access_token) throw new Error("Please sign in again.");
  const response = await fetch(DEMO_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ action, ...data }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "WriterCut could not complete that request.");
  return payload;
}

async function loadAccount(force = false) {
  if (!force && accountCache) return accountCache;
  accountCache = await demoApi("account");
  return accountCache;
}

function profilePage() {
  setTitle("My WriterCut", "Manage your WriterCut song slots and optional demo credits.");
  if (!session) return loginPage(new URLSearchParams("from=/profile"));
  return `<div class="page"><section class="page-hero" data-word="Account"><div class="wrap"><p class="eyebrow"><span class="dot">♫</span>MY WRITERCUT</p><h1 class="display">Your songs.<br><span class="gold">One place.</span></h1><p class="body-large">Your existing account, song slots, and audio stay connected while the new WriterCut experience is staged.</p></div></section><section class="section"><div class="wrap"><div class="stage-notice"><span>●</span><div><strong>Safe staging mode.</strong> Existing songs remain live and untouched. Account data shown below is read from the same WriterCut system.</div></div><div id="accountPanel"><p class="muted">Loading your WriterCut account…</p></div></div></section></div>`;
}

function uploadPage() {
  setTitle("Upload Your Song", "Upload one of your ten best complete songs to WriterCut.");
  return `<div class="page">${shellHero({ eyebrow: "FREE SONG UPLOAD", title: `Put your best<br><span class="gold">song forward.</span>`, body: "Choose one of ten active slots. Add accurate credits, audio, ownership confirmations, and honest AI demo disclosure.", word: "Upload" })}<section class="section"><div class="narrow"><div class="stage-notice"><span>●</span><div><strong>The new upload workspace is being connected.</strong> Real uploads still go through the protected live WriterCut form, so no song or audio is put at risk during this design review.</div></div><div class="quote-panel"><p class="eyebrow">CURRENT LIVE WORKFLOW</p><h2 class="section-title small">Upload safely.<br><span class="gold">Keep building.</span></h2><p class="body-large">Use the existing live form until this staged replacement passes the account, audio, replacement, and disclosure tests.</p><div class="hero-actions"><a class="button button-gold" href="${LIVE_SITE}/upload">Open live upload</a><a class="button button-ghost" href="#/profile">See my slots</a></div></div></div></section></div>`;
}

function demoBuilderPage() {
  setTitle("Demo Builder", "Turn original, human-written lyrics and musical direction into a private AI-assisted demo.");
  if (!session) {
    return `<div class="page">${shellHero({ eyebrow: "WRITERCUT DEMO BUILDER", title: `<span class="gold">You wrote</span> the song.<br>Now let it <span class="gold">be heard.</span>`, body: "Bring your original lyrics and direction. WriterCut helps shape a private, AI-assisted demo up to four minutes. Create a free writer account to keep your songs and future demo credits together.", word: "Demo", actions: `<a class="button button-gold" href="#/signup?type=writer">New here? Join free</a><a class="button button-ghost" href="#/login?from=/demo-builder">Already a writer? Sign in</a>` })}<div class="piano-divider"></div><section class="section"><div class="wrap"><div class="stage-notice"><span>●</span><div><strong>Demo purchases are coming soon.</strong> Review the tool and pricing now. Credits and music generation remain locked during staging.</div></div><div class="pricing-grid" style="margin-top:22px"><article class="price-card featured"><span class="best-value">Best value</span><span class="price-label">Ten demo credits</span><div class="price"><strong>$39.99</strong></div><p>Ten private AI-assisted demos. No subscription.</p><ul class="check-list"><li>Up to four minutes each</li><li>Credits stay with your account</li><li>Clear AI Demo Disclosure</li><li>No artist imitation</li></ul><a class="button button-gold button-wide" href="#/signup?type=writer">Join free for future access</a></article><article class="price-card"><span class="price-label">One demo credit</span><div class="price"><strong>$4.99</strong></div><p>Buy only what you need when purchases open.</p><ul class="check-list"><li>No free first generation</li><li>No automatic renewal</li><li>Technical failures refunded</li></ul></article></div></div></section></div>`;
  }
  return `<div class="page"><section class="page-hero" data-word="Demo"><div class="wrap"><p class="eyebrow"><span class="dot">♫</span>PRIVATE AI-ASSISTED DEMOS</p><h1 class="display"><span class="gold">You wrote</span> the song.<br>Now let it be heard.</h1><p class="body-large">Start with one of your uploaded WriterCut songs or enter a new original song brief. Your demo remains private and clearly disclosed.</p></div></section><div class="piano-divider"></div><section class="builder-wrap"><div class="wrap"><div class="stage-notice"><span>●</span><div><strong>Protected test mode.</strong> The complete interface is live for review; purchasing and ElevenLabs generation remain locked until final approval.</div></div><div class="account-strip"><div class="balance"><span>Demo credits</span><strong id="creditBalance">0</strong></div><p>One credit creates one demo. A verified technical failure returns the credit automatically.</p><button class="button button-ghost" id="jumpToCredits" type="button">Get credits</button></div><div class="builder-grid" style="margin-top:20px"><form class="panel demo-form" id="demoForm"><div class="panel-head"><div><p class="eyebrow">BUILD THE BRIEF</p><h2>Tell us how it should move.</h2></div><span class="step">01</span></div><div class="song-picker"><label class="field-label" for="sourceSong">Start with an uploaded song</label><p>Choose a WriterCut song to prefill its title, lyrics, and creative details—or start fresh.</p><select id="sourceSong" name="sourceSong"><option value="">Start a new demo brief</option></select></div><div class="form-row"><div class="field"><label>Song title</label><input name="title" maxlength="200" required placeholder="Your working title"></div><div class="field"><label>Target length</label><select name="durationSeconds" required><option value="120">2:00</option><option value="150">2:30</option><option value="180" selected>3:00</option><option value="210">3:30</option><option value="240">4:00 maximum</option></select></div></div><div class="field"><label>Original lyrics <span class="counter" id="lyricsCount">0 / 3,000</span></label><textarea name="lyrics" id="lyrics" rows="12" minlength="20" maxlength="3000" required placeholder="[Verse 1]&#10;Paste your original lyrics here…"></textarea></div><div class="field"><label>Melody, structure, and musical direction <span class="counter" id="directionCount">0 / 1,200</span></label><textarea name="melodyDirection" id="melodyDirection" rows="5" minlength="20" maxlength="1200" required placeholder="Describe the energy, instrumentation, structure, and movement. Do not name or imitate a real artist."></textarea></div><div class="form-row"><div class="field"><label>Genre</label><select name="genre" required><option>Country</option><option>Pop</option><option>Rock</option><option>R&amp;B</option><option>Hip-hop</option><option>Folk</option><option>Gospel</option><option>Other</option></select></div><div class="field"><label>Mood</label><select name="mood" required><option>Heartfelt</option><option>Defiant</option><option>Hopeful</option><option>Dark</option><option>Joyful</option><option>Reflective</option></select></div></div><div class="form-row"><div class="field"><label>Tempo</label><select name="tempo" required><option>Slow</option><option selected>Mid-tempo</option><option>Up-tempo</option></select></div><div class="field"><label>Vocal</label><select name="vocalType" required><option>Male</option><option>Female</option><option>Duet</option><option>Instrumental</option></select></div></div><div class="form-row"><div class="field"><label>Co-writers, if any</label><input name="coWriters" maxlength="500" placeholder="Names separated by commas"></div><div class="field"><label>Sensitive themes, if any</label><input name="sensitiveThemeTypes" maxlength="500" placeholder="Optional: grief, addiction, violence…"></div></div><div class="toggle-row"><label><input type="checkbox" name="explicitContent"> Contains explicit language</label><label><input type="checkbox" name="sensitiveThemes"> Contains sensitive themes</label></div><div class="legal-box"><p class="eyebrow">REQUIRED CERTIFICATIONS</p><h3>Protect the song. Protect the people.</h3><label class="check-field"><input type="checkbox" name="ownsInputsCertified" required><span>I own or control every lyric and instruction submitted.</span></label><label class="check-field"><input type="checkbox" name="coWriterAuthorityCertified" required><span>I have every co-writer’s permission to create this demo.</span></label><label class="check-field"><input type="checkbox" name="noInfringementCertified" required><span>My submission does not copy or infringe another person’s work.</span></label><label class="check-field"><input type="checkbox" name="noImpersonationCertified" required><span>I am not requesting a real artist’s style, likeness, or voice.</span></label><label class="check-field"><input type="checkbox" name="acceptableUseCertified" required><span>I will not use this tool for fraud, harassment, hate, exploitation, or illegal conduct.</span></label><label class="check-field"><input type="checkbox" name="aiDisclosureAccepted" required><span>I accept that the result will be labeled as an AI-assisted demo.</span></label><div class="field"><label>Type your full legal name as your signature</label><input name="legalNameSignature" maxlength="255" required autocomplete="name"></div><small>These confirmations are recorded with the request. They do not transfer your ownership to WriterCut.</small></div><button class="button button-gold button-wide" id="generateButton" type="submit" disabled>Get a credit to generate</button><p class="form-message" id="demoMessage" role="status"></p></form><aside class="panel"><div class="panel-head"><div><p class="eyebrow">THE RESULT</p><h2>Your private demos.</h2></div><span class="step">02</span></div><div id="demoList" class="demo-list"><p class="empty-state">Loading your demos…</p></div><div class="rules-card"><strong>What one credit covers</strong><p>One generation up to four minutes. A creative revision uses another credit. A verified technical failure is refunded.</p></div></aside></div><div class="pricing-grid" id="credits" style="margin-top:22px"><article class="price-card"><span class="price-label">One demo</span><div class="price"><strong>$4.99</strong></div><p>$4.99 per song. No subscription.</p><button class="button button-ghost button-wide checkout" data-package="single" type="button">Buy 1 credit</button></article><article class="price-card featured"><span class="best-value">Best value</span><span class="price-label">Ten demos</span><div class="price"><strong>$39.99</strong></div><p>$4.00 per song. No expiration while the account remains active.</p><button class="button button-gold button-wide checkout" data-package="ten_pack" type="button">Buy 10 credits</button></article></div></div></section></div>`;
}

const policyCopy = {
  terms: {
    title: "Terms of Use",
    intro: "WriterCut is a discovery platform. Uploading a song does not sell, assign, license, or transfer ownership to WriterCut or another user.",
    sections: [
      ["Account eligibility", "Users must be at least 18 years old, provide accurate account information, and remain responsible for activity under their accounts."],
      ["Song ownership and authority", "Upload only material you own or control and only when every co-writer or rights holder has authorized the upload. WriterCut may require recorded certifications before accepting content."],
      ["Discovery is not a deal", "A listing, save, message, or hold request does not create a license, publishing agreement, recording agreement, employment relationship, or transfer of rights."],
      ["Acceptable use", "Do not upload infringing material, impersonate another person, misrepresent credits, evade account restrictions, or use WriterCut for fraud, harassment, exploitation, hate, or illegal conduct."],
      ["Demo Builder", "AI-assisted demos are optional paid tools. Each generation requires a credit, rights certifications, and clear disclosure. Requests to imitate a real artist, likeness, style, or voice are prohibited."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "WriterCut collects only the account, catalog, payment, security, and usage information needed to operate and protect the service.",
    sections: [
      ["Information collected", "This may include your name, email, date of birth, profile details, song metadata, audio, rights declarations, demo requests, payment references, security logs, and communications."],
      ["How information is used", "WriterCut uses information to authenticate accounts, host the catalog, process payments, generate requested demos, operate holds, prevent abuse, comply with law, and improve the service."],
      ["Service providers", "WriterCut may use infrastructure, authentication, storage, payment, email, analytics, and music-generation vendors. Providers receive only the information needed to perform their contracted role."],
      ["Your choices", "You may update account information, replace catalog songs, control optional analytics where available, and request account assistance through connect@writercut.com."],
    ],
  },
  dmca: {
    title: "DMCA Policy",
    intro: "WriterCut responds to valid copyright takedown notices and maintains a process for counter-notices and repeat-infringer action.",
    sections: [
      ["Submitting a notice", "A notice should identify the copyrighted work, the challenged WriterCut location, contact information, a good-faith statement, an accuracy and authority statement, and a physical or electronic signature."],
      ["Counter-notices", "A user whose content was removed may submit a compliant counter-notice explaining why the removal resulted from mistake or misidentification."],
      ["Repeat infringement", "WriterCut may restrict or terminate accounts associated with repeated infringement claims when appropriate under the law and platform policy."],
    ],
  },
  copyright: {
    title: "Copyright Policy",
    intro: "Writers retain the rights they own. WriterCut requires upload authority and accurate credit information for every catalog entry.",
    sections: [
      ["No rights transfer", "Uploading creates the limited platform permissions needed to store, display, stream, and operate the service. It does not transfer ownership of the song or recording."],
      ["Co-writers and recordings", "The uploader is responsible for obtaining permission from co-writers, performers, producers, master owners, and any other rights holder whose permission is required."],
      ["AI-assisted demos", "An AI-assisted demo must still be based on human-authored lyrics and composition under WriterCut's current catalog rules and must include honest disclosure of AI involvement."],
    ],
  },
  "hold-terms": {
    title: "Hold Terms",
    intro: "A WriterCut hold is a fixed 30-day catalog status used to document serious industry interest. It is not a license or transfer of rights.",
    sections: [
      ["Request and acceptance", "An approved industry user may request a hold. The writer may accept or decline. A hold becomes active only after acceptance."],
      ["Thirty-day term", "An accepted hold lasts 30 days unless released, withdrawn, or otherwise ended under the platform process."],
      ["No automatic deal", "A hold does not create exclusivity beyond the stated platform status and does not establish compensation, ownership, publishing, recording, or synchronization rights."],
    ],
  },
  "ai-disclosure": {
    title: "AI Demo Disclosure",
    intro: "WriterCut welcomes properly disclosed AI-assisted demos while keeping human songwriting at the center.",
    sections: [
      ["What must remain human-authored", "The uploader must certify the song's lyrics and composition as human-authored under WriterCut's current catalog standard."],
      ["What may use AI", "AI may assist with vocals, instrumentation, accompaniment, arrangement, production, mixing, mastering, and a private Demo Builder generation."],
      ["What is prohibited", "Do not request or submit unauthorized voice clones, real-artist impersonation, deceptive attribution, infringing material, or content created for misconduct."],
      ["Catalog label", "AI-assisted demos receive a clear disclosure so listeners understand how the recording was made. The disclosure describes the demo, not the ownership of the underlying lyrics."],
    ],
  },
  "age-policy": {
    title: "18+ Statement",
    intro: "WriterCut accounts and the Demo Builder are available only to people age 18 or older.",
    sections: [
      ["Adult accounts", "An account holder must provide a valid date of birth and certify adult eligibility during registration."],
      ["No child-directed service", "WriterCut is not designed for children and does not knowingly permit minors to maintain accounts or submit songs."],
      ["Contact", "Questions about age eligibility or an account created in error may be sent to connect@writercut.com."],
    ],
  },
};

function legalPage(key) {
  const policy = policyCopy[key] || policyCopy.terms;
  setTitle(policy.title, policy.intro);
  return `<div class="page"><section class="legal-page"><div class="narrow"><p class="eyebrow"><span class="dot">♫</span>WRITERCUT POLICY</p><h1>${escapeHtml(policy.title)}</h1><p class="updated">Staged brand presentation · Existing policy controls until launch</p><p class="body-large">${escapeHtml(policy.intro)}</p><div class="stage-notice"><span>●</span><div><strong>Legal safeguard.</strong> This page is a staged presentation of the current policy themes. WriterCut’s existing published policy remains controlling until the full text is carried over and approved.</div></div><article class="legal-content">${policy.sections.map(([heading, body]) => `<h2>${escapeHtml(heading)}</h2><p>${escapeHtml(body)}</p>`).join("")}<h2>Questions</h2><p>Contact <a href="mailto:connect@writercut.com">connect@writercut.com</a>.</p></article></div></section></div>`;
}

function notFoundPage() {
  setTitle("Page Not Found", "The requested WriterCut page could not be found.");
  return `<div class="page">${shellHero({ eyebrow: "404", title: `That page missed<br><span class="gold">the cut.</span>`, body: "The song may still be good. The link is not.", word: "404", actions: `<a class="button button-gold" href="#/">Back home</a>` })}</div>`;
}

function showMessage(node, text, state = "") {
  if (!node) return;
  node.textContent = text;
  node.classList.toggle("error", state === "error");
  node.classList.toggle("success", state === "success");
}

function bindLogin() {
  const form = document.querySelector("#loginForm");
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const status = document.querySelector("#loginMessage");
  let captchaToken = "";
  let widgetId;
  loadTurnstile().then((turnstile) => {
    if (!document.contains(form)) return;
    widgetId = turnstile.render(form.querySelector("#loginTurnstile"), {
      sitekey: TURNSTILE_SITE_KEY,
      action: "login",
      theme: "dark",
      callback: (token) => { captchaToken = token; button.disabled = false; showMessage(status, ""); },
      "error-callback": (code) => {
        captchaToken = "";
        button.disabled = true;
        showMessage(status, code === "110200"
          ? "Staging sign-in needs this hostname added to WriterCut’s Cloudflare verification settings. Please use the live WriterCut sign-in for now."
          : "Human verification failed. Please refresh and try again.", "error");
      },
      "expired-callback": () => { captchaToken = ""; button.disabled = true; showMessage(status, "Human verification expired. Please complete it again.", "error"); },
    });
  }).catch((error) => showMessage(status, error.message, "error"));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!captchaToken) return showMessage(status, "Complete human verification to sign in.", "error");
    button.disabled = true;
    showMessage(status, "Signing in…");
    const values = new FormData(form);
    let data, error;
    try {
      ({ data, error } = await supabase.auth.signInWithPassword({
        email: values.get("email"),
        password: values.get("password"),
        options: { captchaToken },
      }));
    } catch (caught) { error = caught; }
    captchaToken = "";
    if (widgetId !== undefined) window.turnstile.reset(widgetId);
    if (error) return showMessage(status, error.message, "error");
    session = data.session;
    accountCache = null;
    go(form.dataset.from || "/profile");
  });
}

function ageFromDob(value) {
  const dob = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(dob.valueOf())) return -1;
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const birthdayPending = now.getUTCMonth() < dob.getUTCMonth() || (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate());
  if (birthdayPending) age -= 1;
  return age;
}

function bindSignup() {
  const form = document.querySelector("#signupForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = document.querySelector("#signupMessage");
    const values = new FormData(form);
    if (ageFromDob(String(values.get("dateOfBirth"))) < 18) return showMessage(status, "WriterCut accounts are limited to adults age 18 or older.", "error");
    button.disabled = true;
    showMessage(status, "Creating your WriterCut account…");
    const redirectTo = `${location.origin}${location.pathname}#/login?verified=1`;
    const { data, error } = await supabase.auth.signUp({
      email: values.get("email"),
      password: values.get("password"),
      options: {
        data: {
          name: String(values.get("name")).trim(),
          account_type: form.dataset.accountType,
          date_of_birth: values.get("dateOfBirth"),
          legal_accepted: Boolean(values.get("legalAccepted")),
        },
        emailRedirectTo: redirectTo,
      },
    });
    button.disabled = false;
    if (error) return showMessage(status, error.message, "error");
    if (data.session) {
      session = data.session;
      go(form.dataset.accountType === "industry" ? "/for-industry" : "/profile");
      return;
    }
    showMessage(status, "Account created. Check your email to verify it, then sign in.", "success");
  });
}

function renderSongSlots(songs = []) {
  const bySlot = new Map(songs.map((song) => [Number(song.slot_number), song]));
  return Array.from({ length: 10 }, (_, index) => {
    const slot = index + 1;
    const song = bySlot.get(slot);
    if (!song) return `<article class="song-slot empty"><span class="slot-num">SLOT ${String(slot).padStart(2, "0")}</span><h3>Open slot</h3><p>Ready for one of your strongest songs.</p></article>`;
    return `<article class="song-slot"><span class="slot-num">SLOT ${String(slot).padStart(2, "0")}</span><h3>${escapeHtml(song.title)}</h3><p>${escapeHtml(song.genre || "Genre not set")} · ${song.is_ai_demo ? "AI-assisted demo disclosed" : "Traditional demo"}</p></article>`;
  }).join("");
}

async function hydrateProfile() {
  const panel = document.querySelector("#accountPanel");
  if (!panel || !session) return;
  try {
    const data = await loadAccount(true);
    const songs = data.songs || [];
    panel.innerHTML = `<div class="section-head"><div><p class="eyebrow">${songs.length} OF 10 ACTIVE</p><h2 class="section-title small">${escapeHtml(data.profile?.name || session.user?.email || "Writer")}’s catalog.</h2></div><p>Your existing uploads remain in their original slots. Demo Builder credits and private generations stay connected to this same account.</p></div><div class="slots-grid">${renderSongSlots(songs)}</div><div class="hero-actions"><a class="button button-gold" href="${LIVE_SITE}/upload">Upload or replace a song</a><a class="button button-ghost" href="#/demo-builder">Build a demo</a></div>`;
  } catch (error) {
    panel.innerHTML = `<div class="stage-notice"><span>!</span><div><strong>Account connection needs attention.</strong> ${escapeHtml(error.message)}</div></div><a class="button button-gold" href="${LIVE_SITE}/profile">Open live account</a>`;
  }
}

function renderDemos(generations = []) {
  const list = document.querySelector("#demoList");
  if (!list) return;
  if (!generations.length) {
    list.innerHTML = '<p class="empty-state">No demos yet. Your finished tracks will appear here.</p>';
    return;
  }
  list.innerHTML = generations.map((item) => `<article class="demo-item"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(String(item.status).toUpperCase())} · ${Math.floor(item.duration_seconds / 60)}:${String(item.duration_seconds % 60).padStart(2, "0")} · AI-assisted demo</small>${item.signed_url ? `<audio controls src="${escapeHtml(item.signed_url)}"></audio>` : ""}</article>`).join("");
}

function fillDemoFromSong(song, form) {
  if (!song || !form) return;
  form.elements.title.value = song.title || "";
  form.elements.lyrics.value = song.lyrics || "";
  form.elements.genre.value = [...form.elements.genre.options].some((option) => option.value === song.genre) ? song.genre : "Other";
  if (song.mood && [...form.elements.mood.options].some((option) => option.value === song.mood)) form.elements.mood.value = song.mood;
  if (song.tempo && [...form.elements.tempo.options].some((option) => option.value === song.tempo)) form.elements.tempo.value = song.tempo;
  if (song.vocal_type && [...form.elements.vocalType.options].some((option) => option.value === song.vocal_type)) form.elements.vocalType.value = song.vocal_type;
  form.elements.coWriters.value = song.co_writers || "";
  form.elements.explicitContent.checked = Boolean(song.explicit_content);
  form.elements.sensitiveThemes.checked = Boolean(song.sensitive_themes);
  form.elements.sensitiveThemeTypes.value = song.sensitive_theme_types || "";
  const direction = [song.description, song.mood && `Mood: ${song.mood}`, song.tempo && `Tempo: ${song.tempo}`, song.vocal_type && `Vocal: ${song.vocal_type}`].filter(Boolean).join("\n");
  form.elements.melodyDirection.value = direction.slice(0, 1200);
  form.dispatchEvent(new Event("input", { bubbles: true }));
}

async function hydrateDemoBuilder() {
  const form = document.querySelector("#demoForm");
  if (!form || !session) return;
  const generateButton = document.querySelector("#generateButton");
  const status = document.querySelector("#demoMessage");
  let creditBalance = 0;
  let songs = [];

  const updateButton = () => {
    const valid = form.checkValidity();
    generateButton.disabled = !DEMO_GENERATION_ENABLED || !(valid && creditBalance > 0);
    generateButton.textContent = !DEMO_GENERATION_ENABLED ? "Demo generation coming soon" : creditBalance > 0 ? "Generate my demo · 1 credit" : "Get a credit to generate";
  };

  try {
    const data = await loadAccount(true);
    creditBalance = data.balance || 0;
    songs = data.songs || [];
    document.querySelector("#creditBalance").textContent = String(creditBalance);
    renderDemos(data.generations || []);
    const picker = document.querySelector("#sourceSong");
    picker.insertAdjacentHTML("beforeend", songs.map((song) => `<option value="${song.id}">Slot ${song.slot_number}: ${escapeHtml(song.title)}</option>`).join(""));
    picker.addEventListener("change", () => fillDemoFromSong(songs.find((song) => String(song.id) === picker.value), form));
    if (data.profile?.name) form.elements.legalNameSignature.placeholder = `Must match: ${data.profile.name}`;
  } catch (error) {
    showMessage(status, error.message, "error");
    renderDemos([]);
  }

  for (const [id, output, max] of [["lyrics", "lyricsCount", 3000], ["melodyDirection", "directionCount", 1200]]) {
    document.querySelector(`#${id}`)?.addEventListener("input", (event) => {
      document.querySelector(`#${output}`).textContent = `${event.target.value.length.toLocaleString()} / ${max.toLocaleString()}`;
    });
  }
  form.addEventListener("input", updateButton);
  updateButton();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    generateButton.disabled = true;
    showMessage(status, "Submitting your protected demo request…");
    const raw = Object.fromEntries(new FormData(form));
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
      const data = await demoApi("generate", { demo: payload });
      showMessage(status, data.message || "Your demo request was received.", "success");
      accountCache = null;
      const refreshed = await loadAccount(true);
      creditBalance = refreshed.balance || 0;
      document.querySelector("#creditBalance").textContent = String(creditBalance);
      renderDemos(refreshed.generations || []);
    } catch (error) {
      showMessage(status, error.message, "error");
    }
    updateButton();
  });

  document.querySelectorAll(".checkout").forEach((button) => {
    if (!DEMO_PURCHASES_ENABLED) {
      button.disabled = true;
      button.textContent = "Purchases coming soon";
      return;
    }
    button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const data = await demoApi("checkout", { packageCode: button.dataset.package });
      location.assign(data.url);
    } catch (error) {
      showMessage(status, error.message, "error");
      form.scrollIntoView({ behavior: "smooth" });
      button.disabled = false;
    }
    });
  });
  document.querySelector("#jumpToCredits")?.addEventListener("click", () => document.querySelector("#credits")?.scrollIntoView({ behavior: "smooth" }));
}

const routes = {
  "/": () => homePage(),
  "/for-writers": () => writersPage(),
  "/for-industry": () => industryPage(),
  "/how-it-works": () => howPage(),
  "/pricing": () => pricingPage(),
  "/discover": () => discoverPage(),
  "/login": ({ params }) => loginPage(params),
  "/signup": ({ params }) => signupPage(params),
  "/profile": () => profilePage(),
  "/upload": () => uploadPage(),
  "/demo-builder": () => demoBuilderPage(),
  "/terms": () => legalPage("terms"),
  "/privacy": () => legalPage("privacy"),
  "/dmca": () => legalPage("dmca"),
  "/copyright": () => legalPage("copyright"),
  "/hold-terms": () => legalPage("hold-terms"),
  "/ai-disclosure": () => legalPage("ai-disclosure"),
  "/age-policy": () => legalPage("age-policy"),
};

async function render() {
  const info = routeInfo();
  updateHeader(info.pathname);
  const page = routes[info.pathname] || notFoundPage;
  app.innerHTML = page(info);
  siteNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "auto" });
  bindLogin();
  bindSignup();
  if (info.pathname === "/profile") await hydrateProfile();
  if (info.pathname === "/demo-builder") await hydrateDemoBuilder();
}

menuToggle.addEventListener("click", () => {
  const open = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

window.addEventListener("hashchange", render);
const { data: { session: initialSession } } = await supabase.auth.getSession();
session = initialSession;
supabase.auth.onAuthStateChange((_event, nextSession) => {
  const changed = session?.access_token !== nextSession?.access_token;
  session = nextSession;
  if (changed) accountCache = null;
  updateHeader(routeInfo().pathname);
});
await render();
