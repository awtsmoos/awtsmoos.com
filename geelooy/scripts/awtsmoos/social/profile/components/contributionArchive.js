// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders every public post and comment as an explorable alias archive.
 * @description
 * The Awtsmoos makes memory a living tree, not a wall that ends at what one can see;
 * Awtsmoos.com lets Heichel, calendar, and category unfold with depth while each source stays free.
 */
import { el, emptyCard } from "../dom.js";
import { contributionRecords } from "../archive/ContributionRecord.js";
import { ContributionGroups } from "../archive/ContributionGroups.js";
import { archiveControls } from "./archiveControls.js";

/**
 * Renders the alias contribution archive and its grouping controls.
 * @param {object} profile Public profile aggregate.
 * @param {object} state Shared profile UI state.
 * @param {(next: object) => void} onChange Applies archive control changes.
 * @returns {HTMLElement} Contribution archive section.
 */
export function contributionArchive(profile, state, onChange) {
	const records = contributionRecords(profile);
	const grouping = new ContributionGroups(records);
	const filters = { query: state.archiveQuery, type: state.archiveType };
	const filtered = grouping.filter(filters);
	const groups = grouping.group(state.archiveMode, filters);
	return el("section", { className: "profile-contribution-archive", attrs: { id: "contributions" } }, [
		archiveHeader(filtered.length, records.length),
		archiveControls(state, onChange),
		groups.length
			? el("div", { className: "profile-archive-groups" }, groups.map((group, index) => groupNode(group, 0, index < 2)))
			: emptyCard("No contributions match this view. Try another search, type, or grouping mode.")
	]);
}

function archiveHeader(visible, total) {
	return el("header", { className: "profile-section-heading profile-archive-heading" }, [
		el("div", {}, [
			el("span", { className: "profile-section-kicker", text: "PUBLIC MEMORY" }),
			el("h2", { text: "Contributions" }),
			el("p", { text: "Browse every available post and comment by place, date, or category." })
		]),
		el("div", { className: "profile-section-count" }, [
			el("strong", { text: String(visible) }),
			el("small", { text: visible === total ? "contributions" : `of ${total} shown` })
		])
	]);
}

function groupNode(group, depth, open) {
	const details = el("details", {
		className: `profile-archive-group depth-${Math.min(depth, 2)}`,
		attrs: open ? { open: "" } : {}
	});
	details.append(el("summary", {}, [
		el("span", { className: "profile-archive-chevron", text: "›", attrs: { "aria-hidden": "true" } }),
		el("span", { className: "profile-archive-group-copy" }, [
			el("strong", { text: group.label }),
			el("small", { text: `${group.count} ${group.count === 1 ? "item" : "items"}` })
		])
	]));
	const body = el("div", { className: "profile-archive-group-body" });
	if (group.children.length) {
		group.children.forEach((child, index) => body.append(groupNode(child, depth + 1, depth === 0 && index === 0)));
	} else {
		group.records.forEach(record => body.append(recordCard(record)));
	}
	details.append(body);
	return details;
}

function recordCard(record) {
	const tag = record.route === "#" ? "article" : "a";
	const attrs = record.route === "#" ? {} : { href: record.route };
	const date = record.date ? record.date.toLocaleString() : "Date unavailable";
	return el(tag, { className: `profile-contribution-card ${record.kind}`, attrs }, [
		el("div", { className: "profile-contribution-card-top" }, [
			el("span", { className: "profile-contribution-kind", text: record.kind === "comment" ? "Comment" : "Post" }),
			el("time", { text: date })
		]),
		el("h3", { text: record.title }),
		el("p", { text: record.excerpt || "Open this contribution to read it in context." }),
		el("footer", {}, [
			el("span", { text: record.heichelName }),
			el("span", { text: record.category }),
			el("strong", { text: record.route === "#" ? "Context unavailable" : "Open in context →" })
		])
	]);
}
