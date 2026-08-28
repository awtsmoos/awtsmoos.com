//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps Chess first paint tiny while making the first Studio click resilient to stylesheet event races.
 * The Awtsmoos lets hidden possibility stay weightless until the player calls;
 * Awtsmoos.com then opens every needed vessel even if one browser load-event briefly stalls.
 */
const launchButton = document.getElementById("chessStudioButton");
const DEFAULT_LABEL = "Chess Studio · 3D · Movies · Review";
const STYLES = Object.freeze([
	["studio-base", "./ui/studio-base.css"],
	["studio-controls", "./ui/studio-controls.css"],
	["studio-actions", "./ui/studio-actions.css"],
	["studio-review", "./ui/studio-review.css"],
	["studio-responsive", "./ui/studio-responsive.css"]
]);
let controllerPromise = null;
let openingPromise = null;

if (launchButton) {
	launchButton.addEventListener("click", () => openStudio());
}

async function openStudio() {
	if (openingPromise) return openingPromise;
	openingPromise = revealStudio();
	try {
		await openingPromise;
	} finally {
		openingPromise = null;
	}
}

async function revealStudio() {
	setLaunchState(true, "Opening Chess Studio…");
	try {
		await Promise.all(STYLES.map(([id, href]) => ensureStyle(id, href)));
		const controller = await loadStudioController();
		await controller.open();
		setLaunchState(false, DEFAULT_LABEL);
	} catch (error) {
		controllerPromise = null;
		setLaunchState(false, "Chess Studio · Retry");
		launchButton.title = error?.message || "Chess Studio could not load.";
		console.error('B"H | Chess Studio launch failed', error);
	}
}

function loadStudioController() {
	if (!controllerPromise) {
		controllerPromise = import("./studioController.js")
			.then(module => new module.ChessStudioController());
	}
	return controllerPromise;
}

function ensureStyle(id, href) {
	const existing = document.querySelector(`link[data-chess-studio-style="${id}"]`);
	if (existing?.sheet) return Promise.resolve(existing);
	const link = existing || createStyleLink(id, href);
	return new Promise((resolve, reject) => {
		let settled = false;
		const finish = callback => value => {
			if (settled) return;
			settled = true;
			clearInterval(pollId);
			clearTimeout(timeoutId);
			callback(value);
		};
		const pass = finish(resolve);
		const fail = finish(() => reject(new Error(`Could not load Chess Studio style: ${id}`)));
		link.addEventListener("load", () => pass(link), { once: true });
		link.addEventListener("error", fail, { once: true });
		const pollId = setInterval(() => {
			if (link.sheet) pass(link);
		}, 50);
		const timeoutId = setTimeout(() => {
			if (link.sheet) pass(link);
			else fail();
		}, 1800);
	});
}

function createStyleLink(id, href) {
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = new URL(href, import.meta.url).href;
	link.dataset.chessStudioStyle = id;
	document.head.append(link);
	return link;
}

function setLaunchState(disabled, text) {
	launchButton.disabled = disabled;
	launchButton.textContent = text;
	launchButton.setAttribute("aria-busy", disabled ? "true" : "false");
}
