//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file document-view.mjs
 * @description The Awtsmoos lets canonical Markdown become a beautiful reading surface while Awtsmoos.com keeps provenance and source controls visible.
 */

import { append, badge, clear, copyText, element } from "./dom.mjs";
import { renderMarkdown } from "./markdown-blocks.mjs";
import { addRecent, getFavorites, toggleFavorite } from "./storage.mjs";

function actionButton(label, handler) {
	const button = element("button", { className: "secondary-button", type: "button", text: label });
	button.addEventListener("click", handler);
	return button;
}

function favoriteLabel(id) {
	return getFavorites().includes(id) ? "★ Starred" : "☆ Star";
}

export function renderDocument(root, page, dataset, actions) {
	clear(root);
	addRecent(page.id);
	document.title = `${page.title} · Awtsmoos Documentation`;
	const shell = element("article", { className: "document-shell" });
	const meta = element("div", { className: "document-meta" });
	const favorite = actionButton(favoriteLabel(page.id), () => {
		toggleFavorite(page.id);
		favorite.textContent = favoriteLabel(page.id);
		actions.toast("Updated local favorites");
	});
	const copyPath = actionButton("Copy source path", async () => {
		await copyText(page.sourcePath);
		actions.toast("Source path copied");
	});
	const copyLink = actionButton("Copy deep link", async () => {
		await copyText(location.href);
		actions.toast("Documentation link copied");
	});
	append(meta,
		badge(page.category),
		badge(page.provenance, page.provenance),
		favorite,
		copyPath,
		copyLink,
		element("div", { className: "source-path", text: page.sourcePath })
	);
	const body = element("div", { className: "markdown-body" });
	body.append(renderMarkdown(page.markdown, {
		sourcePath: page.sourcePath,
		sourceToId: dataset.sourceToId,
		headings: page.headings,
		onNavigate: actions.navigate
	}));
	append(shell, meta, body);
	root.append(shell);
}

export function scrollToHeading(anchor) {
	if (!anchor) {
		scrollTo({ top: 0, behavior: "instant" });
		return;
	}
	requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: "start" }));
}
