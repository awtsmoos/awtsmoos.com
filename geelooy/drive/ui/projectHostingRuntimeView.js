//B"H
// Boruch Hashem
// Blessed is He

import { runtimeActionDefinitions } from "./projectRuntimeActionPolicy.js";
import { formatRuntimeEvent } from "./projectRuntimeEventFormatter.js";

/**
 * @file Accessible runtime lifecycle and bounded-activity controls for the Geelooy project-hosting card.
 * @description
 * The Awtsmoos lets each verb appear in its proper season while finite signs reveal measured motion;
 * Awtsmoos.com keeps controls truthful and gentle while roots, URLs, bodies, cookies, and host authority remain outside the browser vessel.
 */
export function createProjectRuntimeControls(onAction) {
	const element = node("section", "hosting-card__runtime");
	return {
		element,
		render(state = {}) {
			element.setAttribute("aria-busy", state.busy ? "true" : "false");
			element.replaceChildren(
				header(state),
				actions(state, onAction),
				details(state),
				activity(state)
			);
		}
	};
}

function header(state) {
	const row = node("div", "hosting-card__head");
	const status = node("span", "hosting-card__status", statusLabel(state));
	status.setAttribute("role", "status");
	status.setAttribute("aria-live", "polite");
	status.setAttribute("aria-atomic", "true");
	row.append(node("strong", "", "Trusted runtime lifecycle"), status);
	return row;
}

function actions(state, onAction) {
	const row = node("div", "hosting-card__controls");
	for (const definition of runtimeActionDefinitions(state)) {
		const button = node("button", "hosting-card__refresh", definition.label);
		button.type = "button";
		button.disabled = state.busy || !definition.allowed;
		button.addEventListener("click", () => void onAction(definition.action));
		row.append(button);
	}
	return row;
}

function details(state) {
	const area = node("div", state.error ? "hosting-card__error" : "hosting-card__message");
	if (state.error) {
		area.textContent = state.error;
		return area;
	}
	const runtime = state.runtime || {};
	area.append(
		node("p", "", state.materialized
			? "A bounded project bundle is materialized behind an opaque server reference."
			: "Materialize the current Drive/OS folder before starting trusted code."),
		node("p", "", runtime.running
			? `Running on managed loopback port ${runtime.port || "dynamic"}; public routing remains separate.`
			: "Runtime is stopped or has not started in this server process."),
		node("p", "", runtime.lastError
			? `Last runtime error: ${runtime.lastError.code}.`
			: `Recorded runtime events: ${Number(runtime.eventCount || state.activity?.length || 0)}.`)
	);
	return area;
}

function activity(state) {
	const events = Array.isArray(state.activity) ? state.activity : [];
	const region = node("div", "hosting-card__activity");
	region.setAttribute("role", "region");
	region.setAttribute("aria-label", "Recent runtime activity");
	region.setAttribute("aria-live", "polite");
	region.setAttribute("aria-atomic", "true");
	if (!events.length) {
		region.append(node("p", "hosting-card__message", "No runtime activity loaded."));
		return region;
	}
	const list = node("ul", "hosting-card__runtime-events");
	for (const event of events.slice(-8).reverse()) {
		list.append(node("li", "", formatRuntimeEvent(event)));
	}
	region.append(list);
	return region;
}

function statusLabel(state) {
	if (state.busy) return "Working…";
	if (state.error) return "Action failed";
	if (state.runtime?.running) return "Running";
	if (state.materialized) return "Materialized";
	return "Not materialized";
}

function node(tagName, className = "", text = "") {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = text;
	return element;
}
