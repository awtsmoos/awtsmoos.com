//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Runtime payload normalization for hosted Awtsmoos OS actions.
 * @description
 * The Awtsmoos lets many transport garments carry one runtime intention; Awtsmoos.com
 * decodes JSON, base64, files, probes, and interactions here so dispatch families may
 * remain pure maps of deeds instead of repeating parsing noise, and the vessels rhyme.
 */

function json64(value, fallback) {
	if (!value) {
		return fallback;
	}
	try {
		return JSON.parse(Buffer.from(String(value), "base64").toString("utf8"));
	} catch {
		return fallback;
	}
}

function jsonText(value, fallback) {
	if (!value || value === "[object Object]") {
		return fallback;
	}
	if (typeof value === "object") {
		return value;
	}
	try {
		return JSON.parse(String(value));
	} catch {
		return fallback;
	}
}

function arrayFromPayload(...values) {
	for (const value of values) {
		const parsed = jsonText(value, value);
		if (Array.isArray(parsed)) {
			return parsed;
		}
	}
	return [];
}

function actionsFromPayload(payload = {}) {
	return arrayFromPayload(
		payload.interactions,
		payload.browserActions,
		payload.pageActions,
		payload.actions,
		payload.actionsJson,
		json64(payload.interactions64, null),
		json64(payload.browserActions64, null),
		json64(payload.pageActions64, null),
		json64(payload.actions64, null),
		json64(payload.actionsJson64, null)
	);
}

function runtimeFiles(payload = {}) {
	const parsed = jsonText(payload.files, null) || json64(payload.files64, null);
	if (parsed && typeof parsed === "object") {
		return parsed;
	}
	if (payload.html) {
		return { [payload.entry || "index.html"]: String(payload.html) };
	}
	if (payload.content && payload.entry) {
		return { [payload.entry]: String(payload.content) };
	}
	return {};
}

function runtimeOptions(payload = {}) {
	const actions = actionsFromPayload(payload);
	const entry = payload.entry ||
		(payload.path && payload.path !== "." ? payload.path : "index.html");
	return {
		runtime: payload.runtime || "browser",
		entry,
		files: runtimeFiles(payload),
		workflow: workflowOf(payload),
		probes: payload.probes || json64(payload.probes64, []),
		interactions: actions,
		actions,
		browserActions: actions,
		pageActions: actions,
		returnValues: returnValuesOf(payload),
		values: valuesOf(payload),
		origin: payload.origin || "http://localhost:8080/",
		url: payload.url || "http://localhost:8080/"
	};
}

function workflowOf(payload) {
	return payload.workflow ||
		(payload.steps?.length ? { steps: payload.steps } : null) ||
		json64(payload.workflow64, null);
}

function returnValuesOf(payload) {
	return jsonText(
		payload.returnValues || payload.values,
		payload.returnValues || payload.values ||
			json64(payload.returnValues64, []) || json64(payload.values64, [])
	);
}

function valuesOf(payload) {
	return jsonText(
		payload.values || payload.returnValues,
		payload.values || payload.returnValues ||
			json64(payload.values64, []) || json64(payload.returnValues64, [])
	);
}

module.exports = {
	json64,
	jsonText,
	runtimeOptions
};
