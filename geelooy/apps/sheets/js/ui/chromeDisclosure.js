//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Gives Awtsmoos Sheets three calm chrome densities and emits one semantic signal when the vessel changes.
 * @description The Awtsmoos lets immense spreadsheet power fold into Focus, Compact, or Full vessels of light;
 * Awtsmoos.com remembers only local visual preference while nearby contextual surfaces hear one clean disclosure rite.
 */
const MODES = Object.freeze([
	"focus",
	"compact",
	"full"
]);
const STORAGE_KEY = "awtsmoos:sheets:chrome-mode:v1";

export class KeterChromeDisclosure {
	constructor(shell, button) {
		this.shell = shell;
		this.button = button;
		this.mode = this.initialMode();
	}

	/** Binds one button and keyboard shortcut, then applies the first verified local mode. */
	bind() {
		if (!this.shell || !this.button) {
			return;
		}
		this.button.addEventListener("click", () => this.cycle());
		document.addEventListener("keydown", (event) => this.shortcut(event));
		this.apply(this.mode, false);
	}

	/** Cycles Focus → Compact → Full → Focus, preserving advanced capability one gesture away. */
	cycle() {
		const index = MODES.indexOf(this.mode);
		this.apply(MODES[(index + 1) % MODES.length]);
	}

	/** Applies semantic visibility, updates accessibility, persists local choice, and announces the new density. */
	apply(mode, persist = true) {
		this.mode = MODES.includes(mode) ? mode : this.initialMode();
		this.shell.dataset.chromeMode = this.mode;
		setHidden("menuRail", this.mode !== "full");
		setHiddenBySelector(".toolbar", this.mode !== "full");
		setHiddenBySelector(".formula-bar", this.mode === "focus");
		this.button.dataset.chromeMode = this.mode;
		this.button.setAttribute(
			"aria-expanded",
			this.mode === "full" ? "true" : "false"
		);
		this.button.setAttribute(
			"aria-label",
			`Interface density: ${label(this.mode)}`
		);
		this.button.title = `${label(this.mode)} interface · Ctrl/⌘ Shift .`;
		const text = this.button.querySelector("[data-chrome-label]");
		if (text) {
			text.textContent = label(this.mode);
		}
		if (persist) {
			storeMode(this.mode);
		}
		document.dispatchEvent(new CustomEvent("sheets:chrome-mode", {
			detail: { mode: this.mode }
		}));
	}

	/** Handles the compact global shortcut without stealing keystrokes from text editing. */
	shortcut(event) {
		if (!(event.ctrlKey || event.metaKey) || !event.shiftKey || event.key !== ".") {
			return;
		}
		event.preventDefault();
		this.cycle();
	}

	/** Chooses saved preference first, otherwise mobile Focus and desktop Compact. */
	initialMode() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (MODES.includes(saved)) {
				return saved;
			}
		} catch {}
		return window.matchMedia("(max-width: 760px)").matches
			? "focus"
			: "compact";
	}
}

/** Hides or reveals one known row by id so invisible chrome leaves layout and tab order. */
function setHidden(id, hidden) {
	const element = document.getElementById(id);
	if (element) {
		element.hidden = hidden;
	}
}

/** Hides or reveals one known row by selector without moving state ownership outside this class. */
function setHiddenBySelector(selector, hidden) {
	const element = document.querySelector(selector);
	if (element) {
		element.hidden = hidden;
	}
}

/** Stores only local presentation state and never collaborative workbook truth. */
function storeMode(mode) {
	try {
		localStorage.setItem(STORAGE_KEY, mode);
	} catch {}
}

/** Converts one machine density name into compact human-facing text. */
function label(mode) {
	return mode.charAt(0).toUpperCase() + mode.slice(1);
}
