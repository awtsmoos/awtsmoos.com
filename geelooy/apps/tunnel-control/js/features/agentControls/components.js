// B"H

import { h } from "../../ui/dom.js";
import { PRESET_ORDER, duration, progress, stateLabel } from "./model.js";

export function header(control, busy) {
	return h("header", { className: "awt-turn-head" }, [
		h("div", {}, [
			h("p", { className: "eyebrow", text: "MISSION TURN CONTROL" }),
			h("h2", { text: "Calm autonomy, explicit limits." }),
			h("p", {
				text: "Controls the selected mission’s shared continuation lane. Individual room agents remain visible in the room roster."
			})
		]),
		h("div", { className: `awt-turn-state is-${control.observedState || "idle"}` }, [
			h("span", { text: busy ? "Applying…" : "Authoritative state" }),
			h("strong", { text: stateLabel(control) }),
			h("small", { text: `revision ${control.revision || 0}` })
		])
	]);
}

export function presetRow(control, presets, handlers) {
	return h("div", { className: "awt-turn-presets" }, PRESET_ORDER.map(key => {
		const preset = presets?.[key] || {};
		return h("button", {
			className: `awt-turn-preset ${control.preset === key ? "is-active" : ""}`,
			type: "button",
			disabled: handlers.busy,
			on: { click: () => handlers.preset(key) }
		}, [
			h("strong", { text: preset.label || key }),
			h("small", {
				text: `${preset.maxTurns ?? "∞"} turns · ${preset.maxRuntimeMinutes ?? 0}m`
			})
		]);
	}));
}

export function policyFields(control) {
	return h("div", { className: "awt-turn-fields" }, [
		field("turnPreset", "Preset", select(control.preset, ["gentle", "focused", "deep", "overnight", "review"])),
		field("turnMaxTurns", "Turn budget", input(control.maxTurns, 0, 100000)),
		field("turnRuntimeMinutes", "Runtime minutes", input(control.maxRuntimeMinutes, 0, 525600)),
		field("turnMaxErrors", "Consecutive errors", input(control.maxConsecutiveErrors, 1, 1000)),
		field("turnIntervalMs", "Turn interval ms", input(control.intervalMs, 250, 3600000)),
		field("turnCadence", "Update cadence", select(control.updateCadence, ["silent", "gates", "milestones", "normal", "verbose"])),
		field("turnPauseMode", "Safe pause boundary", select(control.pauseMode, ["after-action"]))
	]);
}

export function metrics(control, resources = {}) {
	const scheduler = resources.scheduler || {};
	const registry = resources.schedulerRegistry || {};
	const transactions = resources.transactions || {};
	return h("section", { className: "awt-turn-metrics" }, [
		metric("turns", `${control.startedTurns}/${control.maxTurns || "∞"}`),
		metric("completed", control.completedTurns),
		metric("errors", `${control.consecutiveErrors}/${control.maxConsecutiveErrors}`),
		metric("one-turn credits", control.oneTurnCredits),
		metric("mission timer", scheduler.timerActive ? "active" : "clear"),
		metric("mission in flight", scheduler.inFlight ? "yes" : "no"),
		metric("scheduler entries", registry.count ?? 0),
		metric("all scheduler timers", registry.timers ?? 0),
		metric("transaction keys", transactions.keys ?? 0),
		metric("next tick", scheduler.nextTickAt
			? duration(Date.parse(scheduler.nextTickAt) - Date.now())
			: "none")
	]);
}

export function progressBar(control) {
	return h("div", {
		className: "awt-turn-progress",
		attrs: { "aria-label": "Turn budget progress" }
	}, [
		h("span", { attrs: { style: `width:${progress(control)}%` } })
	]);
}

function field(id, label, control) {
	control.id = id;
	return h("label", { className: "awt-turn-field" }, [
		h("span", { text: label }),
		control
	]);
}

function input(value, min, max) {
	return h("input", { type: "number", value, min, max });
}

function select(value, values) {
	const node = h("select", {}, values.map(item => h("option", {
		value: item,
		text: item,
		selected: item === value
	})));
	node.value = value;
	return node;
}

function metric(label, value) {
	return h("article", {}, [
		h("span", { text: label }),
		h("strong", { text: String(value ?? "—") })
	]);
}
