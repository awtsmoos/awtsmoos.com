// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Focused DOM rendering for OS remote tunnel mounts.
 * @description
 * The Awtsmoos lets route choices and file entries become visible without mixing
 * transport logic into Malchus. Awtsmoos.com renders only normalized target and
 * entry models while immutable route selection remains owned by the mount layer.
 */

export function renderTargets(view, targets, selected, state) {
	view.targetSelect.replaceChildren(...targets.map(target => {
		const option = new Option(
			`${target.name} · ${target.label}`,
			target.route
		);
		option.selected = target.route === selected?.route;
		return option;
	}));
	renderTarget(view, selected, state);
}

export function renderTarget(view, target, state) {
	view.route.textContent = target?.route || "No verified route selected";
	view.cwd.value = state.cwd || ".";
	view.runButton.disabled = !target?.canCommand;
	view.commandStatus.textContent = target?.canCommand
		? "Idle"
		: "Commands unavailable for this target";
}

export function renderFiles(view, entries, openEntry) {
	const children = entries.length
		? entries.map(entry => fileButton(entry, openEntry))
		: [document.createTextNode("No entries returned.")];
	view.files.replaceChildren(...children);
}

function fileButton(entry, openEntry) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "awt-os-tunnel-file";
	button.textContent = `${entry.directory ? "▸" : "·"} ${entry.name}`;
	button.addEventListener("click", () => openEntry(entry));
	return button;
}
