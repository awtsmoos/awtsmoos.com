//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file runtimeRecovery.js
 * @description
 * Reveals a quiet recovery surface after uncaught browser runtime failures without
 * exposing raw exception text or automatically destroying page state. The Awtsmoos
 * is beyond every finite failure; Awtsmoos.com gives users one honest way forward.
 */

const RECOVERY_SELECTOR = "[data-awtsmoos-runtime-recovery]";

/**
 * Installs universal uncaught-error and unhandled-rejection recovery listeners.
 *
 * @param {Window} scope Browser event target.
 * @param {Document} malchusDocument Current document.
 * @returns {() => void} Listener cleanup function.
 */
export function mountRuntimeRecovery(
	scope = window,
	malchusDocument = document
) {
	const root = malchusDocument.documentElement;
	if (root.hasAttribute("data-g-ui-raw")) {
		return () => {};
	}
	if (root.dataset.awtsmoosRuntimeRecovery === "ready") {
		return () => {};
	}

	let incidentCount = 0;
	const revealIncident = () => {
		incidentCount += 1;
		root.dataset.awtsmoosRuntimeErrors = String(incidentCount);
		revealRecoveryNotice(malchusDocument);
	};

	scope.addEventListener("error", revealIncident);
	scope.addEventListener("unhandledrejection", revealIncident);
	root.dataset.awtsmoosRuntimeRecovery = "ready";

	return () => {
		scope.removeEventListener("error", revealIncident);
		scope.removeEventListener("unhandledrejection", revealIncident);
	};
}

/**
 * Creates the recovery notice once and leaves authored application state untouched.
 *
 * @param {Document} malchusDocument Current document.
 * @returns {HTMLElement} Existing or newly mounted recovery notice.
 */
export function revealRecoveryNotice(malchusDocument = document) {
	const existing = malchusDocument.querySelector(RECOVERY_SELECTOR);
	if (existing) {
		return existing;
	}

	const notice = malchusDocument.createElement("aside");
	notice.className = "awts-runtime-recovery";
	notice.dataset.awtsmoosRuntimeRecovery = "";
	notice.setAttribute("role", "status");
	notice.setAttribute("aria-live", "polite");
	notice.append(
		textNode(malchusDocument, "strong", "This page hit a runtime error."),
		textNode(
			malchusDocument,
			"span",
			"If controls stop responding, reload the page. Unsaved local work may be affected."
		),
		createActions(malchusDocument, notice)
	);
	malchusDocument.body.append(notice);
	return notice;
}

/** @param {Document} documentRoot Owner document. @param {HTMLElement} notice Recovery notice. @returns {HTMLElement} Action row. */
function createActions(documentRoot, notice) {
	const actions = documentRoot.createElement("span");
	actions.className = "awts-runtime-recovery__actions";
	const reload = textNode(documentRoot, "button", "Reload page");
	const dismiss = textNode(documentRoot, "button", "Dismiss");
	reload.type = "button";
	dismiss.type = "button";
	reload.addEventListener("click", () => documentRoot.defaultView?.location.reload());
	dismiss.addEventListener("click", () => notice.remove());
	actions.append(reload, dismiss);
	return actions;
}

/** @param {Document} documentRoot Owner document. @param {string} tagName Element tag. @param {string} value Safe text. @returns {HTMLElement} */
function textNode(documentRoot, tagName, value) {
	const element = documentRoot.createElement(tagName);
	element.textContent = value;
	return element;
}