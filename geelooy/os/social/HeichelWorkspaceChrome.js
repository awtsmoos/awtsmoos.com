// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Identity, breadcrumbs, and truthful action chrome for one social OS document.
 * @description
 * The Awtsmoos lets every destination announce its meaning before the traveler moves;
 * Awtsmoos.com keeps View, Revision, Creation, and Profile distinct so no action over-promises what the backend proves.
 */

/** @param {object} descriptor Social document descriptor. @returns {HTMLElement[]} Workspace chrome nodes. */
export function workspaceChrome(descriptor) {
	return [header(descriptor), actions(descriptor), revisionNotice(descriptor)];
}

function header(descriptor) {
	const head = node("header", "geelooy-social-workspace__header");
	const copy = node("div", "geelooy-social-workspace__copy");
	copy.append(text("small", "SOCIAL DOCUMENT"));
	copy.append(text("h2", descriptor.title || "Untitled post"));
	copy.append(text("p", descriptor.summary || "Read this post in context, then continue publishing from the same place."));
	head.append(copy, breadcrumbs(descriptor));
	return head;
}

function breadcrumbs(descriptor) {
	const nav = node("nav", "geelooy-social-workspace__breadcrumbs");
	nav.setAttribute("aria-label", "Social document location");
	for (const value of [
		`@${descriptor.aliasId || "alias"}`,
		descriptor.heichelId || "Heichel",
		descriptor.seriesId || "root",
		descriptor.postId || "post"
	]) {
		nav.append(text("span", value));
	}
	return nav;
}

function actions(descriptor) {
	const nav = node("nav", "geelooy-social-workspace__actions");
	nav.setAttribute("aria-label", "Social document actions");
	nav.append(action("↗", "Open", "New tab", descriptor.viewUrl));
	const revision = descriptor.revisionUrl || revisionUrl(descriptor);
	if (revision) nav.append(action("✎", "Create revision", "Reference this post", revision));
	if (descriptor.composeUrl) nav.append(action("＋", "Create", "New post here", descriptor.composeUrl));
	if (descriptor.aliasId) nav.append(action("◎", "Profile", "Public alias", `/@${encodeURIComponent(descriptor.aliasId)}`));
	return nav;
}

function revisionNotice(descriptor) {
	const note = node("aside", "geelooy-social-workspace__notice");
	note.append(text("strong", "Revision workflow"));
	note.append(text("p", descriptor.directEditReason || "Creates a source-linked revision. Direct existing-post mutation is not assumed."));
	return note;
}

function revisionUrl(descriptor) {
	if (!descriptor.aliasId || !descriptor.heichelId || !descriptor.postId) return "";
	const params = new URLSearchParams({
		alias: descriptor.aliasId,
		heichel: descriptor.heichelId,
		series: descriptor.seriesId || "root",
		source: descriptor.postId,
		sourceType: "post",
		sourceHeichel: descriptor.heichelId,
		sourceSeries: descriptor.seriesId || "root",
		sourceAlias: descriptor.aliasId,
		return: descriptor.viewUrl || ""
	});
	return `/social-composer?${params.toString()}`;
}

function action(icon, title, detail, href) {
	const link = node("a", "geelooy-social-workspace__action");
	link.href = href;
	link.target = "_blank";
	link.rel = "noopener";
	const copy = node("span", "geelooy-social-workspace__action-copy");
	copy.append(text("strong", title), text("small", detail));
	link.append(text("span", icon), copy, text("b", "›"));
	return link;
}

function node(tag, className = "") {
	const element = document.createElement(tag);
	if (className) element.className = className;
	return element;
}

function text(tag, value) {
	const element = document.createElement(tag);
	element.textContent = String(value || "");
	return element;
}
