// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file A rich doorway from an alias into one of their Heichelos.
 * @description
 * The Awtsmoos lets a place be more than a title and a lonely gate;
 * Awtsmoos.com reveals role, purpose, publishing path, and workspace state.
 */
import { el } from "../dom.js";

/** @param {object} item Public Heichel membership record. @returns {HTMLElement} Context-rich Heichel card. */
export function heichelCard(item) {
	const id = String(item.id || "");
	const name = item.name || id || "Untitled Heichel";
	const role = item.role || item.permission || "Member";
	return el("article", { className: "profile-heichel-card profile-context-card" }, [
		el("header", { className: "profile-context-path" }, [
			el("span", { className: "profile-context-token" }, [
				el("i", { text: "♜", attrs: { "aria-hidden": "true" } }),
				el("span", { text: role })
			]),
			el("small", { text: `Heichel · ${id || "public"}` })
		]),
		el("div", { className: "profile-context-body" }, [
			el("span", { className: "profile-context-kind", text: "PUBLISHING SPACE" }),
			el("h3", { text: name }),
			el("p", { text: item.description || "A public place containing series, posts, conversations, and shared ideas." })
		]),
		el("footer", { className: "profile-heichel-actions" }, [
			action("Browse", "Open series and posts", `/heichelos/${encodeURIComponent(id)}`),
			action("OS", "Open as folders", `/os?heichel=${encodeURIComponent(id)}&openSocial=1`),
			action("Write", "Create inside this Heichel", `/social-composer?heichelId=${encodeURIComponent(id)}`)
		])
	]);
}

function action(label, detail, href) {
	return el("a", { className: "profile-heichel-action", attrs: { href } }, [
		el("strong", { text: label }),
		el("small", { text: detail }),
		el("span", { text: "›", attrs: { "aria-hidden": "true" } })
	]);
}
