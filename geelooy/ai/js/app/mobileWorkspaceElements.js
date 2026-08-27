//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Names the three responsive rooms and creates their close controls.
 *
 * The scene metadata is the keli; the user's movement is the ohr. The Awtsmoos
 * renews both at every instant, while Awtsmoos.com uses this one map so crown,
 * dock, panels, and accessibility never speak contradictory names.
 */
export const MOBILE_WORKSPACE_QUERY = "(max-width: 900px)";

export const MOBILE_WORKSPACE_SCENES = Object.freeze({
	chat: Object.freeze({
		panelKey: "main",
		label: "AI Chat",
		triggers: [".mobile-nav-chat"]
	}),
	conversations: Object.freeze({
		panelKey: "sidebar",
		label: "Conversations",
		triggers: [".mobile-crown-menu", ".mobile-nav-conversations", ".mobile-nav-search"]
	}),
	automation: Object.freeze({
		panelKey: "automationPanel",
		label: "Automation",
		triggers: [".mobile-crown-code", ".mobile-nav-automation", ".mobile-nav-settings"]
	})
});

/**
 * Normalizes an untrusted scene name to a real responsive room.
 *
 * @param {string} scene Candidate scene name.
 * @returns {"chat"|"conversations"|"automation"} Safe scene name.
 */
export function normalizeMobileScene(scene) {
	return Object.hasOwn(MOBILE_WORKSPACE_SCENES, scene)
		? scene
		: "chat";
}

/**
 * Resolves the panel element belonging to a scene.
 *
 * @param {string} scene Scene name.
 * @param {object} dom Application DOM references.
 * @returns {HTMLElement|null} Scene panel or null.
 */
export function panelForMobileScene(scene, dom = {}) {
	const normalized = normalizeMobileScene(scene);
	const key = MOBILE_WORKSPACE_SCENES[normalized].panelKey;
	return dom[key] || null;
}

/**
 * Returns every trigger participating in responsive navigation.
 *
 * @param {ParentNode} root Search root.
 * @returns {HTMLElement[]} Unique trigger elements.
 */
export function mobileWorkspaceTriggers(root = document) {
	const selectors = Object.values(MOBILE_WORKSPACE_SCENES)
		.flatMap(definition => definition.triggers);
	return [...new Set(selectors.flatMap(selector => [...root.querySelectorAll(selector)]))];
}

/**
 * Creates one honest close control inside a side panel's existing topbar.
 *
 * @param {HTMLElement|null} panel Side panel receiving the control.
 * @param {string} label Human-facing panel label.
 * @param {() => void} onClose Close callback.
 * @returns {HTMLButtonElement|null} Existing or created close button.
 */
export function ensureMobilePanelClose(panel, label, onClose) {
	const actions = panel?.querySelector?.(".panel-actions");
	if (!actions) {
		return null;
	}
	let button = actions.querySelector(".mobile-workspace-close");
	if (!button) {
		button = document.createElement("button");
		button.type = "button";
		button.className = "mobile-workspace-close";
		button.textContent = "×";
		actions.prepend(button);
	}
	button.setAttribute("aria-label", `Close ${label}`);
	button.onclick = onClose;
	return button;
}
