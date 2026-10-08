//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Kavanah gate: intention is required to enter the Kodesh HaKodashim.
 * @description The Kohen Gadol entered alone, once a year, with preparation.
 * Here: a quiet interstitial — one breath, one tap — passed once per
 * teaching per session. Never a paywall, never a nag, never tracking.
 * Pure intention.
 */

import { classify } from "./mapper.mjs";

/** Session store key marking a teaching as entered with kavanah. */
export function kavanahKey(urlOrPath) {
	return `mikdash:kavanah:${urlOrPath}`;
}

/**
 * True when this URL requires the kavanah gate.
 * Only Kodesh HaKodashim URLs require it.
 */
export function requiresKavanah(urlOrPath) {
	return classify(urlOrPath) === "kodesh";
}

/**
 * Render the kavanah interstitial HTML.
 * Minimal, still, warm. One heading, one breath, one button.
 * @param {{title?: string, continueUrl: string, returnUrl: string}} opts
 */
export function renderKavanahGate(opts) {
	const { title = "A deep teaching", continueUrl, returnUrl } = opts;
	if (!continueUrl) throw new Error("renderKavanahGate: continueUrl is required");
	const esc = (s) =>
		String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
	return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kavanah — Awtsmoos</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #f3ecd9; color: #1a1410;
    font-family: Georgia, "Times New Roman", serif; text-align: center; padding: 2rem;
  }
  .kavanah { max-width: 30em; }
  .kavanah-mark { font-size: 2rem; color: #8a6a2a; margin-bottom: 1rem; }
  h1 { font-size: 1.6rem; font-weight: 400; margin: 0 0 1rem; }
  p { line-height: 1.8; margin: 0 0 2rem; color: #3a2f23; }
  .kavanah-enter {
    font: inherit; font-size: 1.1rem; padding: 0.9rem 2.5rem; cursor: pointer;
    background: #1a1410; color: #f3ecd9; border: none; border-radius: 999px;
    min-height: 44px;
  }
  .kavanah-enter:hover, .kavanah-enter:focus-visible { background: #2b2118; outline: 2px solid #8a6a2a; outline-offset: 3px; }
  .kavanah-return { display: block; margin-top: 1.5rem; color: #8a6a2a; font-size: 0.95rem; }
</style>
</head>
<body>
  <main class="kavanah">
    <div class="kavanah-mark" aria-hidden="true">✦</div>
    <h1>You are entering the Kodesh HaKodashim</h1>
    <p>“${esc(title)}” is among the deepest teachings. Take one breath. Leave the noise outside. Enter alone with the text.</p>
    <a class="kavanah-enter" href="${esc(continueUrl)}" data-kavanah-enter>Enter with kavanah</a>
    <a class="kavanah-return" href="${esc(returnUrl || "/heichelos")}">Return to the courtyard</a>
  </main>
</body>
</html>`;
}

/**
 * Client-side helper source: records the kavanah pass in sessionStorage
 * so the gate is shown once per teaching per session.
 * Include once on kodesh pages; the gate page itself links straight through.
 */
export const KAVANAH_CLIENT_JS = `
(function () {
  try {
    var m = document.querySelector("[data-kavanah-enter]");
    if (!m) return;
    m.addEventListener("click", function () {
      try { sessionStorage.setItem("mikdash:kavanah:" + location.pathname, "1"); } catch (e) {}
    });
  } catch (e) {}
})();
`.trim();

/**
 * True when the visitor already passed the gate for this path in this session.
 * @param {string} urlOrPath
 * @param {{getItem:(k:string)=>string|null}} storage sessionStorage-like
 */
export function passedKavanah(urlOrPath, storage) {
	try {
		return storage.getItem(kavanahKey(urlOrPath)) === "1";
	} catch {
		return false;
	}
}
