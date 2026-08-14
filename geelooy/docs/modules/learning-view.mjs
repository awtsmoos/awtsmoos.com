//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file learning-view.mjs
 * @description The Awtsmoos lets documentation become a curriculum with local progress while every lesson opens its canonical source-backed document.
 */

import { append, badge, clear, element } from "./dom.mjs";
import { isComplete, toggleComplete, trackProgress } from "./learning-progress.mjs";
import { learningTracks, trackRecords } from "./learning-tracks.mjs";

function stepRow(sourcePath, record, actions, rerender) {
	const row = element("div", { className: "learn-step" });
	const complete = isComplete(sourcePath);
	const toggle = element("button", {
		className: "learn-check",
		type: "button",
		text: complete ? "✓" : "○",
		title: complete ? "Mark incomplete" : "Mark complete"
	});
	toggle.addEventListener("click", () => {
		toggleComplete(sourcePath);
		rerender();
	});
	const open = element("button", {
		className: "learn-step-open",
		type: "button",
		text: record?.title || sourcePath
	});
	if (record) open.addEventListener("click", () => actions.openDocument(record.id));
	else open.disabled = true;
	append(row, toggle, open, element("code", { text: sourcePath }));
	return row;
}

function trackCard(track, dataset, actions, rerender) {
	const progress = trackProgress(track.steps);
	const card = element("article", { className: "learn-track" });
	const header = element("div", { className: "learn-track-head" });
	append(header, badge(track.level), element("strong", { text: `${progress.percent}%` }));
	append(card,
		header,
		element("h2", { text: track.title }),
		element("p", { text: track.summary }),
		element("div", { className: "learn-progress" })
	);
	card.querySelector(".learn-progress").style.setProperty("--progress", `${progress.percent}%`);
	const steps = element("div", { className: "learn-steps" });
	for (const item of trackRecords(track, dataset)) {
		steps.append(stepRow(item.sourcePath, item.record, actions, rerender));
	}
	card.append(steps);
	return card;
}

export function renderLearning(root, dataset, actions) {
	clear(root);
	const rerender = () => renderLearning(root, dataset, actions);
	const hero = element("section", { className: "hero learn-hero" });
	append(hero,
		element("p", { className: "eyebrow", text: "Learn · source-backed curriculum" }),
		element("h1", { text: "Learn Awtsmoos.com as a system." }),
		element("p", { text: "Choose a path. Every lesson opens canonical human documentation and can descend into generated API evidence, source, callers, and tests." })
	);
	const actionsRow = element("div", { className: "learn-actions" });
	const api = element("button", { className: "primary-button", type: "button", text: "Explore all API routes" });
	api.addEventListener("click", actions.openApi);
	const curriculum = dataset.byId.get(dataset.sourceToId.get("docs/LEARN/README.md"));
	const manual = element("button", { className: "secondary-button", type: "button", text: "Open curriculum manual" });
	if (curriculum) manual.addEventListener("click", () => actions.openDocument(curriculum.id));
	append(actionsRow, api, manual);
	const grid = element("div", { className: "learn-grid" });
	for (const track of learningTracks) grid.append(trackCard(track, dataset, actions, rerender));
	append(root, hero, actionsRow, grid);
}
