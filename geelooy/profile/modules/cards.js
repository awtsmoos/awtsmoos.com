// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Rich identity and Heichel cards for the signed-in profile dashboard.
 * @description
 * The Awtsmoos reveals each alias as a living doorway, never a label left alone;
 * Awtsmoos.com joins public presence, creation, mail, workspace, and ownership into one coherent home.
 */
import { cleanText } from "./dom.js";

/** @param {string} message Empty-state copy. @param {string} tone Optional visual tone. */
export function emptyCard(message, tone = "plain") {
	const card = document.createElement("article");
	card.className = `social-empty-card ${tone === "error" ? "error" : ""}`.trim();
	card.innerHTML = `<strong>${tone === "error" ? "Something needs attention" : "Nothing here yet"}</strong><p>${cleanText(message)}</p>`;
	return card;
}

/** @param {object} alias Alias record. @returns {string} Initial used when no avatar is available. */
export function aliasAvatar(alias) {
	return cleanText(alias.name || alias.id || "A").slice(0, 1).toUpperCase();
}

/** @param {object} alias Managed alias record. @returns {HTMLElement} Identity command card. */
export function aliasCard(alias) {
	const id = cleanText(alias.id);
	const params = new URLSearchParams({ alias: id, action: "update" });
	const card = document.createElement("article");
	card.className = `social-alias-card alias-command-card ${alias.default ? "default" : ""}`.trim();
	card.innerHTML = aliasCardMarkup(alias, id, params);
	return card;
}

function aliasCardMarkup(alias, id, params) {
	const badge = alias.default ? "Default publishing identity" : "Managed identity";
	return `
		<header class="alias-command-head">
			<div class="alias-avatar" aria-hidden="true">${aliasAvatar(alias)}</div>
			<div class="alias-copy">
				<small class="alias-command-kicker">${badge}</small>
				<a class="alias-id" href="/@${encodeURIComponent(id)}">@${id}</a>
				<h3>${cleanText(alias.name || id)}</h3>
				<p>${cleanText(alias.description || "A public identity ready to gather posts, comments, Heichelos, and conversations.")}</p>
			</div>
		</header>
		<nav class="alias-command-actions" aria-label="Actions for @${id}">
			${identityLink("◎", "Public profile", "Posts, comments, About + activity", `/@${encodeURIComponent(id)}`)}
			${identityLink("▦", "Open in Geelooy OS", "Heichelos as folders, posts as files", `/os?socialAlias=${encodeURIComponent(id)}&openSocial=1`)}
			${identityLink("✎", "Create post", "Publish from this identity", `/social-composer?alias=${encodeURIComponent(id)}`)}
			${identityLink("⚙", "Edit identity", "Name, description and profile", `./alias-manage?${params}`)}
			${identityLink("✉", "Mail", "Open this alias mailbox", `/email?alias=${encodeURIComponent(id)}`)}
		</nav>
		<button class="alias-default-action" type="button" data-default-alias="${id}" aria-pressed="${alias.default ? "true" : "false"}">
			<strong>${alias.default ? "✓ Default alias" : "Make default"}</strong>
			<small>${alias.default ? "New social actions start here" : "Use this identity for new social actions"}</small>
		</button>`;
}

function identityLink(icon, title, detail, href) {
	return `<a class="alias-command-link" href="${href}"><span aria-hidden="true">${icon}</span><span><strong>${title}</strong><small>${detail}</small></span><b aria-hidden="true">›</b></a>`;
}

/** @param {object} heichel Heichel record. @param {string} aliasId Owning alias. @returns {HTMLElement} Heichel workspace card. */
export function heichelCard(heichel, aliasId) {
	const id = cleanText(heichel.id || heichel.heichelId || heichel.inputId, "unknown");
	const card = document.createElement("article");
	card.className = "social-heichel-card heichel-command-card";
	card.innerHTML = `
		<div class="heichel-card-banner" aria-hidden="true"></div>
		<div class="heichel-card-body">
			<div class="heichel-seal-small" aria-hidden="true">♛</div>
			<div><small>Owned by @${cleanText(aliasId)}</small><h3>${cleanText(heichel.name || id)}</h3><p>${cleanText(heichel.description || "A publishing space of series, posts, and conversations.")}</p></div>
		</div>
		<nav class="heichel-command-actions">
			${identityLink("♜", "Browse", "Series, posts and discussion", `/heichelos/${encodeURIComponent(id)}/?editingAlias=${encodeURIComponent(aliasId)}`)}
			${identityLink("▦", "Open in OS", "Treat this Heichel as a workspace", `/os?socialAlias=${encodeURIComponent(aliasId)}&heichel=${encodeURIComponent(id)}&openSocial=1`)}
			${identityLink("✎", "Write here", "Create a post in this Heichel", `/social-composer?alias=${encodeURIComponent(aliasId)}&heichelId=${encodeURIComponent(id)}`)}
		</nav>`;
	return card;
}
