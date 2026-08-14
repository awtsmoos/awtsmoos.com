//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-explorer-view.mjs
 * @description The Awtsmoos lets Data, Security, and Realtime contracts become one source-backed explorer without flattening their different meanings into route or project rows.
 */

import { append, clear, element } from "./dom.mjs";
import { renderSystemDetail } from "./system-detail.mjs";
import { renderSystemList } from "./system-list.mjs";

export function renderSystemExplorer(root, dataset, state, actions) {
	clear(root);
	const hero = element("section", { className: "system-explorer-hero" });
	append(hero,
		element("p", { className: "eyebrow", text: "Systems Explorer · persistence + trust + realtime" }),
		element("h1", { text: "Trace the contracts between data, identity, and live state." }),
		element("p", { text: `${dataset.systems.length} curated systems join human meaning to bounded source evidence. Environment names never include values; events remain lexical clues.` })
	);
	const shell = element("div", { className: "system-explorer-shell" });
	const list = element("aside", { className: "system-explorer-list" });
	const detail = element("article", { className: "system-explorer-detail" });
	renderSystemList(list, dataset, state, {
		select: actions.selectSystem,
		update: actions.updateSystemFilters
	});
	renderSystemDetail(detail, dataset.systemById.get(state.system) || null, dataset, actions);
	append(shell, list, detail);
	append(root, hero, shell);
}
