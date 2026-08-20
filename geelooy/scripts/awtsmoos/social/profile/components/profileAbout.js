// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The public identity chamber for one alias.
 * @description
 * The Awtsmoos gives the alias more than a label in a row;
 * Awtsmoos.com lets biography, action, publishing, and place together glow.
 */
import { el } from "../dom.js";

/**
 * Renders identity context and meaningful next actions for one public alias.
 * @param {object} profile Public profile aggregate.
 * @returns {HTMLElement} About and action surface.
 */
export function profileAbout(profile) {
	const aliasId = String(profile.alias?.id || "");
	const identity = profile.profile || {};
	const description = identity.about || identity.bio || identity.description || "This alias has not written an About section yet.";
	const heichelCount = Array.isArray(profile.heichelos) ? profile.heichelos.length : 0;
	const postCount = Array.isArray(profile.posts) ? profile.posts.length : 0;
	const commentCount = Array.isArray(profile.comments) ? profile.comments.length : 0;
	return el("section", { className: "profile-about-panel", attrs: { id: "about" } }, [
		el("header", { className: "profile-section-heading" }, [
			el("div", {}, [
				el("span", { className: "profile-section-kicker", text: "IDENTITY" }),
				el("h2", { text: "About this alias" }),
				el("p", { text: "Identity, publishing places, and the fastest ways to continue the conversation." })
			])
		]),
		el("div", { className: "profile-about-grid" }, [
			el("article", { className: "profile-about-story" }, [
				el("span", { className: "profile-about-handle", text: `@${aliasId}` }),
				el("p", { text: description }),
				el("div", { className: "profile-about-metrics" }, [
					metric(postCount, "Posts"),
					metric(commentCount, "Comments"),
					metric(heichelCount, "Heichelos")
				])
			]),
			el("nav", { className: "profile-about-actions", attrs: { "aria-label": "Alias actions" } }, [
				action("✎", "Create a post", "Publish from your current alias", "/social-composer"),
				action("▦", "Open in Geelooy OS", "Explore Heichelos like folders", `/os?socialAlias=${encodeURIComponent(aliasId)}&openSocial=1`),
				action("↗", "Share this profile", "Open the canonical public identity", `/@${encodeURIComponent(aliasId)}`),
				action("✉", "Message", "Start a direct conversation", `/email?to=${encodeURIComponent(aliasId)}`)
			])
		])
	]);
}

function metric(value, label) {
	return el("span", { className: "profile-about-metric" }, [
		el("strong", { text: String(value) }),
		el("small", { text: label })
	]);
}

function action(icon, title, detail, href) {
	return el("a", { className: "profile-about-action", attrs: { href } }, [
		el("span", { className: "profile-about-action-icon", text: icon, attrs: { "aria-hidden": "true" } }),
		el("span", { className: "profile-about-action-copy" }, [
			el("strong", { text: title }),
			el("small", { text: detail })
		]),
		el("span", { className: "profile-about-action-arrow", text: "›", attrs: { "aria-hidden": "true" } })
	]);
}
