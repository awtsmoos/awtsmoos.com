// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes the public alias into a few deep destinations instead of many shallow tabs.
 * @description
 * The Awtsmoos is One while the pathways unfold in measured grace;
 * Awtsmoos.com gives contributions, library, network, and activity each a living place.
 */
import { el, emptyCard } from "../dom.js";
import { profileState, setArchiveView } from "../state.js";
import { contributionArchive } from "./contributionArchive.js";
import { profileAbout } from "./profileAbout.js";
import { heichelCard } from "./heichelCard.js";
import { treeCard } from "./treeCard.js";
import { activityFeed } from "./activityFeed.js";
import { historyCard } from "./historyCard.js";
import { recommendations } from "./recommendations.js";
import { graphPreview } from "./graphPreview.js";

/** @param {object} profile Public profile aggregate. @param {Function} repaint Re-renders the profile shell. */
export function profileSection(profile, repaint) {
	const sections = {
		about: () => profileAbout(profile),
		contributions: () => contributionArchive(profile, profileState, next => {
			setArchiveView(next);
			repaint();
		}),
		library: () => librarySection(profile),
		network: () => networkSection(),
		activity: () => activitySection(profile)
	};
	return (sections[profileState.activeTab] || sections.contributions)();
}

function librarySection(profile) {
	return sectionShell("PUBLISHING PLACES", "Library", "Heichelos, series, and posts arranged as a navigable publishing world.", [
		list(profile.heichelos, heichelCard, "No public Heichelos are available for this alias yet."),
		treeCard(profile.tree || profile.seriesTree || [])
	]);
}

function networkSection() {
	return sectionShell("SOCIAL GRAPH", "Network", "Followers, following, recommendations, and relationship context in one place.", [
		el("div", { className: "profile-network-columns" }, [
			connectionList("Followers", profileState.followers, followerCard, "No followers yet."),
			connectionList("Following", profileState.profileFollows, followCard, "This alias is not following anything yet.")
		]),
		recommendations(profileState.recommendations),
		graphPreview(profileState.graph || { nodes: [], edges: [] })
	]);
}

function activitySection(profile) {
	const history = profile.history || profile.dashboard?.continueReading || [];
	return sectionShell("RECENT SIGNAL", "Activity", "Recent contributions and reading history without mixing them into identity settings.", [
		activityFeed(profile.activity || []),
		el("section", { className: "profile-history-stack" }, [
			el("h3", { text: "Reading history" }),
			list(history, historyCard, "No public reading history is available.")
		])
	]);
}

function sectionShell(kicker, title, detail, children) {
	return el("section", { className: "profile-deep-section" }, [
		el("header", { className: "profile-section-heading" }, [
			el("div", {}, [
				el("span", { className: "profile-section-kicker", text: kicker }),
				el("h2", { text: title }),
				el("p", { text: detail })
			])
		]),
		...children
	]);
}

function connectionList(title, items, maker, emptyText) {
	return el("section", { className: "profile-connection-column" }, [
		el("h3", { text: title }),
		list(items, maker, emptyText)
	]);
}

function list(items = [], maker, emptyText) {
	const wrap = el("div", { className: "profile-card-list" });
	if (!items.length) {
		wrap.append(emptyCard(emptyText));
	}
	items.forEach(item => wrap.append(maker(item)));
	return wrap;
}

function followCard(item) {
	const type = item.type || "alias";
	const href = type === "alias" ? `/@${encodeURIComponent(item.id)}` : `/heichelos/${encodeURIComponent(item.id)}`;
	return connectionCard(type, item.id, "Following", href);
}

function followerCard(aliasId) {
	return connectionCard("alias", aliasId, "Follows this alias", `/@${encodeURIComponent(aliasId)}`);
}

function connectionCard(type, id, detail, href) {
	return el("a", { className: "profile-follow-card profile-rich-link", attrs: { href } }, [
		el("span", { className: "profile-rich-link-icon", text: type === "alias" ? "◎" : "♜" }),
		el("span", {}, [el("small", { text: type }), el("strong", { text: `@${id}` }), el("span", { text: detail })]),
		el("b", { text: "›", attrs: { "aria-hidden": "true" } })
	]);
}
