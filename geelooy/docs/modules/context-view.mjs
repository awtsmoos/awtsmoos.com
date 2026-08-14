//B"H
//Boruch Hashem
//Blessed is He

/** @file context-view.mjs @description The Awtsmoos lets a long document reveal its inner ladder; Awtsmoos.com keeps headings and provenance beside the reading flow. */

import { append, clear, element } from "./dom.mjs";

export function renderContext(root, page, onHeading) {
	clear(root);
	append(root,
		element("p", { className: "eyebrow", text: page.category }),
		element("p", { className: "context-title", text: "On this page" })
	);
	for (const heading of page.headings.filter(item => item.level >= 2 && item.level <= 4)) {
		const link = element("a", {
			className: "context-link",
			href: `#${heading.anchor}`,
			text: heading.text
		});
		link.style.paddingLeft = `${Math.max(0, heading.level - 2) * 10}px`;
		link.addEventListener("click", event => {
			event.preventDefault();
			onHeading(heading.anchor);
		});
		root.append(link);
	}
	append(root,
		element("p", { className: "context-title", text: "Provenance" }),
		element("p", { className: "source-path", text: `${page.provenance} · ${page.sourcePath}` })
	);
}

export function clearContext(root) {
	clear(root);
	append(root,
		element("p", { className: "eyebrow", text: "Awtsmoos.com" }),
		element("p", { className: "source-path", text: "Open a document to reveal its headings and source path here." })
	);
}
