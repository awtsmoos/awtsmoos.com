//B"H
// Boruch Hashem
// Blessed is He

import {
	MOBILE_WORKSPACE_SCENES,
	mobileWorkspaceTriggers,
	normalizeMobileScene,
	panelForMobileScene
} from "./mobileWorkspaceElements.js";

const FOCUSABLE_SELECTOR = [
	"button:not([disabled])",
	"a[href]",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[tabindex]:not([tabindex='-1'])"
].join(",");

/**
 * Owns focus, inert state, and ARIA truth for the responsive rooms.
 *
 * Gevurah prevents focus from entering a concealed panel; Chesed returns the
 * traveler to the opening control. The Awtsmoos joins both in Tiferes, and
 * Awtsmoos.com receives a workspace usable without sight or pointer.
 */
export class MobileWorkspaceFocusPolicy {
	constructor(dom = {}) {
		this.dom = dom;
		this.returnTarget = null;
	}

	/** Remembers the control that opened a temporary room. */
	remember(target) {
		if (typeof HTMLElement !== "undefined" && target instanceof HTMLElement) {
			this.returnTarget = target;
		}
	}

	/** Clears a remembered trigger without moving focus. */
	forget() {
		this.returnTarget = null;
	}

	/** Synchronizes panel visibility and navigation state. */
	apply(scene, mobile) {
		const activeScene = normalizeMobileScene(scene);
		for (const name of Object.keys(MOBILE_WORKSPACE_SCENES)) {
			this.syncPanel(name, activeScene, mobile);
		}
		this.syncTriggers(activeScene, mobile);
		if (mobile && activeScene !== "chat") {
			queueMicrotask(() => this.focusScene(activeScene));
		}
	}

	/** Returns focus after a drawer closes. */
	restore() {
		const target = this.returnTarget;
		this.forget();
		queueMicrotask(() => {
			if (target?.isConnected) {
				target.focus();
			}
		});
	}

	syncPanel(name, activeScene, mobile) {
		const panel = panelForMobileScene(name, this.dom);
		if (!panel) {
			return;
		}
		const active = !mobile || name === activeScene;
		panel.inert = !active;
		if (active) {
			panel.removeAttribute("aria-hidden");
		} else {
			panel.setAttribute("aria-hidden", "true");
		}
	}

	syncTriggers(activeScene, mobile) {
		for (const trigger of mobileWorkspaceTriggers()) {
			const selected = mobile && triggerMatchesScene(trigger, activeScene);
			trigger.setAttribute("aria-pressed", String(selected));
		}
	}

	focusScene(scene) {
		const panel = panelForMobileScene(scene, this.dom);
		const target = panel?.querySelector?.(FOCUSABLE_SELECTOR) || panel;
		target?.focus?.({ preventScroll: true });
	}
}

function triggerMatchesScene(trigger, scene) {
	return MOBILE_WORKSPACE_SCENES[scene].triggers.some(selector => {
		return trigger.matches(selector);
	});
}
