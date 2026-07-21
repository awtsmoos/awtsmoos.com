// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicFeedIdentity
 * @description
 * Identity is responsibility, not surveillance. The Awtsmoos gives Awtsmoos.com
 * a visible author, alias, context, and route while preserving honest uncertainty.
 */
import { appendChildren, createElement, createIcon, link } from "./dom.js";
function initials(name) {
	return String(name || "?")
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase())
		.join("") || "?";
}
function timeData(value) {
	if (!value) {
		return null;
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return { label: String(value), datetime: undefined };
	}
	return {
		label: new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "short"
		}).format(date),
		datetime: date.toISOString()
	};
}
function createAvatar(documentRef, model) {
	if (!model.authorAvatar) {
		return createElement(documentRef, "span", "cosmic-avatar", {
			"aria-hidden": "true",
			text: initials(model.authorName)
		});
	}
	const vessel = createElement(documentRef, "span", "cosmic-avatar", {
		"aria-hidden": "true"
	});
	vessel.append(createElement(documentRef, "img", "cosmic-avatar-image", {
		src: model.authorAvatar,
		alt: "",
		loading: "lazy",
		decoding: "async"
	}));
	return vessel;
}
function createBreadcrumbs(documentRef, model) {
	const crumbs = [
		model.heichelId ? {
			label: model.heichelId,
			href: model.raw?.heichelHref || `/heichelos/${encodeURIComponent(model.heichelId)}`
		} : null,
		model.seriesId && model.seriesId !== "root" ? {
			label: model.seriesId,
			href: model.raw?.seriesHref || model.href
		} : null
	].filter(Boolean);
	if (!crumbs.length) {
		return null;
	}
	const navigation = createElement(documentRef, "nav", "cosmic-breadcrumbs", {
		"aria-label": "Post location"
	});
	const list = createElement(documentRef, "ol", "cosmic-breadcrumb-list");
	for (const crumb of crumbs) {
		const item = createElement(documentRef, "li", "cosmic-breadcrumb-item");
		item.append(link(documentRef, crumb.label.replace(/[-_]+/g, " "), crumb.href, "cosmic-breadcrumb-link"));
		list.append(item);
	}
	navigation.append(list);
	return navigation;
}
/** Builds the author identity and provenance path for one article. */
export function renderPostIdentity(documentRef, model) {
	const identity = createElement(documentRef, "header", "cosmic-post-identity");
	const details = createElement(documentRef, "div", "cosmic-identity-details");
	const row = createElement(documentRef, "div", "cosmic-name-row");
	const fallbackHref = model.authorAlias !== "unknown" ?
		`/profile/${encodeURIComponent(model.authorAlias.replace(/^@/, ""))}` : "";
	const name = model.authorHref || fallbackHref ?
		link(documentRef, model.authorName, model.authorHref || fallbackHref, "cosmic-author-name") :
		createElement(documentRef, "span", "cosmic-author-name", { text: model.authorName });
	row.append(name);
	if (model.verified) {
		const badge = createElement(documentRef, "span", "cosmic-verification", {
			"aria-label": "Verified author"
		});
		badge.append(createIcon(documentRef, "✓"));
		row.append(badge);
	}
	if (model.role) {
		row.append(createElement(documentRef, "span", "cosmic-role-badge", { text: model.role }));
	}
	const meta = createElement(documentRef, "div", "cosmic-identity-meta");
	meta.append(createElement(documentRef, "span", "cosmic-alias", {
		text: `@${model.authorAlias.replace(/^@/, "")}`
	}));
	const timestamp = timeData(model.createdAt);
	if (timestamp) {
		meta.append(createElement(documentRef, "time", "cosmic-time", {
			datetime: timestamp.datetime,
			text: timestamp.label
		}));
	}
	if (model.visibility) {
		meta.append(createElement(documentRef, "span", "cosmic-visibility", {
			text: model.visibility
		}));
	}
	appendChildren(details, row, meta, createBreadcrumbs(documentRef, model));
	appendChildren(identity, createAvatar(documentRef, model), details);
	return identity;
}
