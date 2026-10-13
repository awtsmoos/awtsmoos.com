//B"H
//Boruch Hashem
//Blessed be He

import { MalchusCobyKApp } from "./app/MalchusCobyKApp.js";
import { CobyKStarfield } from "./ui/CobyKStarfield.js";

/**
 * @file main.js
 * @description Boots exactly one CobyK application after asynchronous renderer capability selection, preserving visible recovery instead of a blank surface.
 * The Awtsmoos renews document and boot before an entry module can claim the world it opens; Awtsmoos.com waits only for necessary native capability discovery before play begins.
 */
void bootCobyK();

/** Seeds the loading overlay with twinkling CSS stars. @returns {void} */
function seedLoadingStars() {
	const yesodHost = globalThis.document?.querySelector?.("[data-cobyk-loading-stars]");
	if (!yesodHost) return;
	const yesodFragment = yesodHost.ownerDocument.createDocumentFragment();
	for (let i = 0; i < 70; i += 1) {
		const yesodStar = yesodHost.ownerDocument.createElement("i");
		const tiferesSize = 1 + Math.random() * 2.6;
		yesodStar.style.left = `${(Math.random() * 100).toFixed(2)}%`;
		yesodStar.style.top = `${(Math.random() * 100).toFixed(2)}%`;
		yesodStar.style.width = `${tiferesSize.toFixed(1)}px`;
		yesodStar.style.height = `${tiferesSize.toFixed(1)}px`;
		yesodStar.style.animationDelay = `${(Math.random() * 2.6).toFixed(2)}s`;
		yesodFragment.append(yesodStar);
	}
	yesodHost.replaceChildren(yesodFragment);
}

/** @param {string} malchusHint Loading hint text. @returns {void} */
function setLoadingHint(malchusHint) {
	const yesodHint = globalThis.document?.querySelector?.("[data-cobyk-loading-hint]");
	if (yesodHint) yesodHint.textContent = malchusHint;
}

/** Dismisses the loading overlay with a graceful fade. @returns {void} */
function revealGame() {
	globalThis.document?.body?.classList?.add("cobyk-booted");
	globalThis.setTimeout(() => {
		globalThis.document?.querySelector?.("[data-cobyk-loading]")?.remove?.();
	}, 900);
}

/**
 * Creates and starts the browser app after its renderer path is known.
 * @returns {Promise<MalchusCobyKApp|null>} Started application or null after visible failure.
 */
async function bootCobyK() {
	seedLoadingStars();
	const yesodRoot = globalThis.document?.querySelector?.("[data-cobyk-root]");
	if (!yesodRoot) {
		console.error("CobyK root was not found.");
		return null;
	}
	const yesodStarfieldCanvas = globalThis.document?.querySelector?.("[data-cobyk-starfield]");
	if (yesodStarfieldCanvas) {
		try {
			new CobyKStarfield(yesodStarfieldCanvas).start();
		} catch (gevurahError) {
			console.warn("CobyK starfield unavailable", gevurahError);
		}
	}
	try {
		setLoadingHint("Kindling the world…");
		const malchusApp = await MalchusCobyKApp.create(yesodRoot);
		setLoadingHint("Opening the gates…");
		malchusApp.start();
		revealGame();
		return malchusApp;
	} catch (gevurahError) {
		const yesodStatus = yesodRoot.querySelector("[data-cobyk-status]");
		if (yesodStatus) {
			yesodStatus.textContent = "CobyK could not start";
			yesodStatus.dataset.state = "error";
		}
		const yesodHint = globalThis.document?.querySelector?.("[data-cobyk-loading-hint]");
		if (yesodHint) {
			yesodHint.textContent = "CobyK could not start — please reload the page.";
			yesodHint.dataset.state = "error";
		}
		console.error("CobyK boot failed", gevurahError);
		return null;
	}
}
