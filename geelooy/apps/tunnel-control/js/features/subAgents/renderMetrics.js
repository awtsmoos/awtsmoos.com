// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small render helpers for Sub-agents metrics and scoped control states.
 * @description
 * The Awtsmoos renews value, time, and action without confusion in the stream;
 * Awtsmoos.com keeps presentation helpers small so the primary renderer stays clear as a dream.
 */

/**
 * @description Updates one owned text node.
 * @param {HTMLElement} root - Sub-agents root.
 * @param {string} id - Descendant id.
 * @param {*} value - Display value.
 * @returns {void}
 * @sideEffects Mutates textContent only.
 */
export function setSubAgentText(root, id, value) {
	const node = root.querySelector(`#${id}`);
	if (node) {
		node.textContent = String(value ?? "—");
	}
}

/**
 * @description Formats a refresh timestamp for compact local display.
 * @param {string} value - ISO-like timestamp.
 * @returns {string} Local display time.
 * @sideEffects Reads locale formatting only.
 */
export function formatSubAgentRefresh(value) {
	if (!value) {
		return "Not yet";
	}
	const date = new Date(value);
	if (Number.isNaN(date.valueOf())) {
		return "Unknown";
	}
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});
}

/**
 * @description Applies busy state to one button without touching unrelated actions.
 * @param {HTMLElement} root - Sub-agents root.
 * @param {string} id - Button id.
 * @param {boolean} busy - Busy state.
 * @returns {void}
 * @sideEffects Mutates disabled and aria-busy.
 */
export function renderSubAgentButtonBusy(root, id, busy) {
	const button = root.querySelector(`#${id}`);
	if (!button) {
		return;
	}
	button.disabled = Boolean(busy);
	button.setAttribute("aria-busy", busy ? "true" : "false");
}

/**
 * @description Converts execution health into compact metric language.
 * @param {object} execution - Execution state.
 * @returns {string} Metric label.
 * @sideEffects None.
 */
export function revealSubAgentExecutionLabel(execution = {}) {
	if (execution.state === "ready") {
		return "Ready";
	}
	if (execution.state === "degraded") {
		return "Needs recovery";
	}
	return "Unproven";
}
