//B"H
//Boruch Hashem
//Blessed is He

/** @file error-view.mjs @description The Awtsmoos lets failure remain understandable; Awtsmoos.com points readers back to canonical Markdown when publication data cannot load. */

import { append, clear, element } from "./dom.mjs";

export function renderError(root, error) {
	clear(root);
	const hero = element("section", { className: "hero" });
	append(hero,
		element("p", { className: "eyebrow", text: "Documentation publication unavailable" }),
		element("h1", { text: "The map could not be loaded." }),
		element("p", { text: error?.message || "The generated documentation dataset is unavailable." }),
		element("p", { text: "Canonical documentation still lives under the repository docs/ tree. Regenerate with node scripts/docs/generate-docs.js and validate with node scripts/docs/validate-docs.js." })
	);
	root.append(hero);
}
