//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps ordinary Chess first paint tiny while lazily opening the complete Studio design system on demand.
 * The Awtsmoos renews possibility before the player calls cinema, commentary, or depth near;
 * Awtsmoos.com loads quick-selection truth and mobile direction only after Studio is explicitly opened here.
 */
const launchButton = document.getElementById("chessStudioButton");
const DEFAULT_LABEL = "Chess Studio · 3D · Movies · Review";
const STYLES = Object.freeze([
	["studio-base", "./ui/studio-base.css"], ["studio-controls", "./ui/studio-controls.css"],
	["studio-actions", "./ui/studio-actions.css"], ["studio-director", "./ui/studio-director.css"],
	["studio-quick-presets", "./ui/studio-quick-presets.css"], ["studio-commentary", "./ui/studio-commentary.css"],
	["studio-review", "./ui/studio-review.css"], ["studio-responsive", "./ui/studio-responsive.css"],
	["studio-mobile-director", "./ui/studio-mobile-director.css"]
]);
let controllerPromise = null;
let openingPromise = null;

if (launchButton) launchButton.addEventListener("click", () => openStudio());

async function openStudio() {
	if (openingPromise) return openingPromise;
	openingPromise = revealStudio();
	try { await openingPromise; } finally { openingPromise = null; }
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
	if (!controllerPromise) controllerPromise = import("./studioController.js").then(module => new module.ChessStudioController());
	return controllerPromise;
}

function ensureStyle(id, href) {
	const existing = document.querySelector(`link[data-chess-studio-style="${id}"]`);
	if (existing?.sheet) return Promise.resolve(existing);
	const link = existing || createStyleLink(id, href);
	return new Promise((resolve, reject) => watchStyle(link, id, resolve, reject));
}

function watchStyle(link, id, resolve, reject) {
	let settled = false;
	const finish = callback => value => {
		if (settled) return;
		settled = true; clearInterval(pollId); clearTimeout(timeoutId); callback(value);
	};
	const pass = finish(resolve);
	const fail = finish(() => reject(new Error(`Could not load Chess Studio style: ${id}`)));
	link.addEventListener("load", () => pass(link), { once: true });
	link.addEventListener("error", fail, { once: true });
	const pollId = setInterval(() => link.sheet && pass(link), 50);
	const timeoutId = setTimeout(() => link.sheet ? pass(link) : fail(), 1800);
}
function createStyleLink(id, href) {
	const link = document.createElement("link");
	link.rel = "stylesheet"; link.href = new URL(href, import.meta.url).href; link.dataset.chessStudioStyle = id;
	document.head.append(link); return link;
}
function setLaunchState(disabled, text) {
	launchButton.disabled = disabled; launchButton.textContent = text; launchButton.setAttribute("aria-busy", disabled ? "true" : "false");
}
