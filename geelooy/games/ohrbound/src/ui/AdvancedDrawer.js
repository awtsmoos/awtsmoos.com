//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AdvancedDrawer.js
 * @description Keeps optional power one gesture away while the default UI stays quiet.
 * The Awtsmoos contains revealed and concealed depth in one indivisible source;
 * Awtsmoos.com lets advanced keilim unfold only when the traveler chooses their course.
 */
export class AdvancedDrawer {
	constructor(root, preferences, callbacks = {}) {
		this.root = root;
		this.preferences = preferences;
		this.callbacks = callbacks;
		this.triggers = [...document.querySelectorAll("[data-open-advanced]")];
		this.returnFocus = null;
	}

	/** Attaches drawer, preference, action, and keyboard behavior exactly once. */
	attach() {
		for (const trigger of this.triggers) {
			trigger.addEventListener("click", () => this.open(trigger));
		}
		this.root.querySelector("[data-advanced-close]").onclick = () => this.close();
		this.root.addEventListener("pointerdown", event => {
			if (event.target === this.root) this.close();
		});
		this.root.addEventListener("change", event => this.changePreference(event));
		this.root.addEventListener("click", event => this.runAction(event));
		document.addEventListener("keydown", event => {
			if (event.key === "Escape" && this.isOpen()) this.close();
		});
		this.root.inert = true;
		this.preferences.subscribe(settings => this.render(settings));
	}

	/** Opens the retractable surface and moves focus to its close control. */
	open(trigger = document.activeElement) {
		this.returnFocus = trigger;
		this.root.inert = false;
		this.root.dataset.open = "true";
		this.root.setAttribute("aria-hidden", "false");
		for (const item of this.triggers) item.setAttribute("aria-expanded", "true");
		this.root.querySelector("[data-advanced-close]").focus();
	}

	/** Closes the surface, removes it from focus order, and optionally restores focus. */
	close(restoreFocus = true) {
		this.root.dataset.open = "false";
		this.root.setAttribute("aria-hidden", "true");
		this.root.inert = true;
		for (const item of this.triggers) item.setAttribute("aria-expanded", "false");
		if (restoreFocus) this.returnFocus?.focus?.();
	}

	/** Returns whether the optional surface is presently revealed. */
	isOpen() {
		return this.root.dataset.open === "true";
	}

	/** Converts a changed control into a small normalized preference patch. */
	changePreference(event) {
		const control = event.target.closest("[data-pref]");
		if (!control) return;
		const value = control.type === "checkbox" ? control.checked : control.value;
		this.preferences.update({ [control.dataset.pref]: value });
	}

	/** Retracts first, then runs a shortcut so new modals receive focus cleanly. */
	runAction(event) {
		const button = event.target.closest("[data-advanced-action]");
		if (!button) return;
		const callback = this.callbacks[button.dataset.advancedAction];
		this.close(false);
		requestAnimationFrame(() => callback?.());
	}

	/** Synchronizes controls from preference truth without reopening the drawer. */
	render(settings) {
		for (const control of this.root.querySelectorAll("[data-pref]")) {
			const value = settings[control.dataset.pref];
			if (control.type === "checkbox") control.checked = Boolean(value);
			else control.value = value;
		}
	}
}
