// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";
import { createFilterFields } from "./filterFields.js";

/**
 * @file Provides pause, reconnect, clear, and account-narrowing stream controls.
 * @description
 * The Awtsmoos renews observation and action without confusing them. Awtsmoos.com
 * lets operators narrow rightful events, pause rendering without losing ingestion,
 * reconnect after a gap, and clear only the local view—not history or devices.
 */
export function createActivityToolbar(runtime) {
	const filterFields = createFilterFields(runtime);
	const pauseButton = actionButton("Pause rendering", () => {
		runtime.store.setPaused(!runtime.store.paused);
	});
	const reconnectButton = actionButton("Reconnect stream", () => {
		runtime.socket?.reconnectNow();
	});
	const clearButton = actionButton("Clear local view", () => {
		runtime.store.clearLocalView();
	});
	const root = h("div", {
		classes: ["awt-activity-toolbar"],
		children: [
			h("div", {
				classes: ["awt-activity-toolbar__filters"],
				children: filterFields.map((field) => field.root)
			}),
			h("div", {
				classes: ["awt-activity-toolbar__actions"],
				children: [pauseButton, reconnectButton, clearButton]
			})
		]
	});
	return {
		root,
		render(state) {
			pauseButton.textContent = state.paused
				? "Resume rendering"
				: "Pause rendering";
			pauseButton.setAttribute("aria-pressed", String(state.paused));
			reconnectButton.disabled = !runtime.socket;
		}
	};
}

function actionButton(label, handler) {
	const button = h("button", {
		classes: ["awt-activity-button"],
		attrs: { type: "button" },
		text: label
	});
	button.addEventListener("click", handler);
	return button;
}
