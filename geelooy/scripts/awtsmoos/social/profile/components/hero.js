// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The public alias hero: identity, status, and immediate social action.
 * @description
 * The Awtsmoos renews a name beyond a thumbnail or title alone;
 * Awtsmoos.com gives each alias presence, context, and a doorway of its own.
 */
import { el } from "../dom.js";

/** @param {object} profile Public profile aggregate. @returns {HTMLElement} Rich identity hero. */
export function hero(profile) {
	const identity = profile.profile || {};
	const alias = profile.alias || {};
	const name = identity.displayName || alias.name || alias.id || "Alias";
	const bannerAttrs = identity.banner ? { style: `background-image:url('${safeStyleUrl(identity.banner)}')` } : {};
	return el("section", { className: "profile-hero profile-hero-revelation" }, [
		el("div", { className: "profile-banner", attrs: bannerAttrs }, [
			el("span", { className: "profile-banner-glow", attrs: { "aria-hidden": "true" } })
		]),
		el("div", { className: "profile-identity" }, [
			avatar(identity, name),
			el("div", { className: "profile-copy" }, [
				el("span", { className: "profile-identity-eyebrow", text: "PUBLIC ALIAS" }),
				el("h1", { text: name }),
				el("p", { className: "profile-handle", text: `@${alias.id || "alias"}` }),
				el("p", { className: "profile-bio", text: identity.bio || identity.description || "A public identity gathering posts, comments, Heichelos, and relationships." })
			]),
			el("div", { className: "profile-hero-actions" }, [
				action("✉", "Message", "Direct conversation", `/email?to=${encodeURIComponent(alias.id || "")}`),
				action("✎", "Publish", "Create something new", "/social-composer")
			])
		])
	]);
}

function avatar(identity, name) {
	if (identity.avatar) {
		return el("div", { className: "profile-avatar profile-avatar-photo" }, [
			el("img", { attrs: { src: identity.avatar, alt: `${name} avatar`, loading: "lazy" } })
		]);
	}
	return el("div", { className: "profile-avatar", text: name.slice(0, 1).toUpperCase() || "A", attrs: { "aria-label": `${name} avatar` } });
}

function action(icon, title, detail, href) {
	return el("a", { className: "profile-hero-action", attrs: { href } }, [
		el("span", { className: "profile-hero-action-icon", text: icon, attrs: { "aria-hidden": "true" } }),
		el("span", {}, [el("strong", { text: title }), el("small", { text: detail })])
	]);
}

function safeStyleUrl(value) {
	return String(value || "").replace(/["'()\\]/g, "");
}
