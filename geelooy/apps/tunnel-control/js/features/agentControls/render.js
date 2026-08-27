// B"H

import { h, $ } from "../../ui/dom.js";
import { continuationOf } from "./model.js";
import * as C from "./components.js";

export function renderAgentControls(state, handlers) {
	const root = $("roomAgentControls");
	if (!root) return;
	if (!state.selectedMissionId) {
		root.className = "awt-turn-control is-empty";
		root.replaceChildren(emptyState());
		return;
	}
	const control = continuationOf(state);
	root.className = `awt-turn-control is-${control.observedState || "idle"}`;
	const children = [
		C.header(control, state.turnBusy),
		C.presetRow(control, state.continuationPresets, handlers),
		C.progressBar(control),
		h("div", { className: "awt-turn-body" }, [
			h("section", { className: "awt-turn-policy panel" }, [
				h("h3", { text: "Turn policy" }),
				C.policyFields(control),
				controlActions(handlers)
			]),
			h("section", { className: "awt-turn-resources panel" }, [
				h("h3", { text: "Leak and lifecycle evidence" }),
				C.metrics(control, state.resourceStatus),
				h("p", {
					className: "notice",
					text: resourceMessage(state.resourceStatus)
				})
			])
		]),
		destructiveActions(handlers)
	];
	if (state.turnError) {
		children.push(h("p", {
			className: "notice danger",
			text: state.turnError
		}));
	}
	root.replaceChildren(...children);
}

function controlActions(handlers) {
	return h("div", { className: "awt-turn-actions" }, [
		button("Save limits", handlers.save, handlers.busy, "primary"),
		button("Pause", handlers.pause, handlers.busy),
		button("Resume", handlers.resume, handlers.busy),
		button("Run one turn", handlers.once, handlers.busy),
		button("Refresh evidence", handlers.refresh, handlers.busy)
	]);
}

function destructiveActions(handlers) {
	return h("section", { className: "awt-turn-danger" }, [
		h("div", {}, [
			h("strong", { text: "Safe endings" }),
			h("p", {
				text: "Drain finishes the active turn and starts no new one. Stop also removes the scheduler registry when idle."
			})
		]),
		h("div", { className: "button-row" }, [
			button("Drain", handlers.drain, handlers.busy, "warning"),
			button("Stop and clean", handlers.stop, handlers.busy, "danger")
		])
	]);
}

function button(text, handler, disabled, className = "") {
	return h("button", {
		type: "button",
		text,
		disabled,
		className,
		on: { click: handler }
	});
}

function resourceMessage(resources = {}) {
	const scheduler = resources.scheduler || {};
	const transactions = resources.transactions || {};
	if (!scheduler.timerActive && !scheduler.inFlight && !(transactions.keys > 0)) {
		return "No active timer, turn, or transaction key is reported for this control snapshot.";
	}
	return "Resources are active because this mission is running, waiting, or finishing a turn. Stop and clean should return them to zero.";
}

function emptyState() {
	return h("div", { className: "empty-state" }, [
		h("strong", { text: "Open a mission room to control its turns." }),
		h("p", {
			text: "Budgets and pause state are stored with the mission, not only in this browser."
		})
	]);
}
