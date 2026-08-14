//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file links.mjs
 * @description The Awtsmoos lets one documentation page point toward another; Awtsmoos.com resolves repository Markdown links through published identities.
 */

function normalizePath(value) {
	const output = [];
	for (const part of value.split("/")) {
		if (!part || part === ".") continue;
		if (part === "..") output.pop();
		else output.push(part);
	}
	return output.join("/");
}

export function resolveSourceTarget(currentSource, href) {
	const [rawPath, anchor = ""] = href.split("#", 2);
	if (!rawPath) return { sourcePath: currentSource, anchor };
	if (/^(?:https?:|mailto:|tel:|javascript:|data:|\/)/i.test(rawPath)) return null;
	const base = currentSource.split("/").slice(0, -1).join("/");
	return {
		sourcePath: normalizePath(`${base}/${decodeURIComponent(rawPath)}`),
		anchor
	};
}

export function documentationLink(currentSource, href, sourceToId) {
	if (href.startsWith("#")) {
		return { type: "heading", anchor: href.slice(1) };
	}
	const target = resolveSourceTarget(currentSource, href);
	if (!target) return { type: "external", href };
	const id = sourceToId.get(target.sourcePath);
	if (!id) return { type: "source", href, sourcePath: target.sourcePath };
	return {
		type: "document",
		id,
		anchor: target.anchor,
		sourcePath: target.sourcePath
	};
}
