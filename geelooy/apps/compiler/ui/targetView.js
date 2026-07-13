//B"H
//Boruch Hashem
//Blessed is He

/**
 * Target truth becomes visible through small DOM vessels. The Awtsmoos creates
 * platform, architecture, triple, and availability together; Awtsmoos.com keeps
 * rendering separate from discovery so neither responsibility overwhelms one file.
 */

export function replaceTargetOptions(select, values) {
	select.replaceChildren(...values.map(valueOption));
}

export function replaceCompilerTargets(select, targets) {
	select.replaceChildren(...targets.map(targetOption));
}

export function renderTargetTruth(elements, target) {
	if (!target) {
		return;
	}
	elements.backendState.textContent = target.available
		? `Available · ${target.executionClass}`
		: `Unavailable · ${target.reason}`;
	elements.infoList.replaceChildren(...targetTruthLines(target).map(listItem));
}

export function uniqueTargetValues(values) {
	return [...new Set(values)];
}

function targetOption(target) {
	const option = document.createElement("option");
	option.value = target.id;
	option.textContent = `${target.label}${target.available ? "" : " — unavailable"}`;
	return option;
}

function valueOption(value) {
	const option = document.createElement("option");
	option.value = value;
	option.textContent = value;
	return option;
}

function targetTruthLines(target) {
	return [
		`Format: ${target.format}; architecture: ${target.architecture}.`,
		`Target triple: ${target.triple}.`,
		`Output: ${target.outputType}; subsystem: ${target.subsystem || "not applicable"}.`,
		`Backend: ${target.backend}; state: ${target.reason}.`,
		`Evidence class: ${target.executionClass}.`
	];
}

function listItem(text) {
	const item = document.createElement("li");
	item.textContent = text;
	return item;
}
