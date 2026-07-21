// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos recreates truth without mutating yesterday's vessel. This
 * Awtsmoos.com adapter derives a view model while preserving the fetched record.
 */

import {
	audioSource,
	graphNodes,
	pollOptions,
	resolveArchetype,
	sourceIdentity
} from "./archetype.js";

function firstText(...values) {
	for (const value of values) {
		if (typeof value === "string" && value.trim()) {
			return value.trim();
		}
	}
	return "";
}

function list(value) {
	return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizePollOptions(raw) {
	return pollOptions(raw).map((option, index) => ({
		id: String(option?.id ?? index),
		label: firstText(option?.label, option?.title, option?.text, String(option)),
		percent: Number(option?.percent ?? option?.percentage ?? 0)
	})).filter((option) => option.label);
}

function normalizeGraphNodes(raw) {
	return graphNodes(raw).slice(0, 7).map((node, index) => ({
		id: String(node?.id ?? index),
		label: firstText(node?.label, node?.title, node?.name, `Source ${index + 1}`),
		href: firstText(node?.href, node?.url),
		relation: firstText(node?.relation, node?.type, "reference")
	}));
}

/**
 * Derives the immutable card model consumed by semantic renderers.
 * @param {Record<string, unknown>} post Normalized feed object.
 * @returns {Record<string, unknown>}
 */
export function createPostModel(post) {
	const raw = post.raw || {};
	const archetype = resolveArchetype(post);
	const source = sourceIdentity(post, archetype);
	const media = audioSource(raw, post.assets);
	const authorAlias = firstText(post.authorAlias, raw.aliasId, raw.author?.alias, "unknown");
	return Object.freeze({
		id: String(post.id || post.contentId || ""),
		type: String(post.type || raw.type || "post"),
		archetype,
		source,
		title: firstText(post.title, raw.name, "Untitled source"),
		summary: firstText(post.summary, raw.description),
		body: firstText(raw.content, raw.body, post.summary, raw.description),
		href: firstText(post.href, raw.href, raw.url),
		authorAlias,
		authorName: firstText(raw.authorName, raw.author?.name, raw.profileName, authorAlias),
		authorHref: firstText(raw.authorHref, raw.author?.href, raw.profileUrl),
		authorAvatar: firstText(raw.authorAvatar, raw.author?.avatar, raw.avatarUrl),
		verified: Boolean(raw.verified || raw.author?.verified),
		role: firstText(raw.role, raw.author?.role),
		createdAt: raw.createdAt || raw.timestamp || "",
		visibility: firstText(raw.visibility, raw.audience),
		heichelId: firstText(post.heichelId, raw.heichelId),
		seriesId: firstText(post.seriesId, raw.seriesId),
		quote: firstText(raw.quote, raw.highlight),
		citation: firstText(raw.citation, raw.sourceReference, raw.canonicalSource),
		citationHref: firstText(raw.citationHref, raw.sourceHref, raw.referenceUrl),
		tags: list(raw.tags || raw.topics).slice(0, 6).map(String),
		participants: list(raw.participants).slice(0, 5),
		responses: list(raw.expertResponses || raw.responses).slice(0, 2),
		audioSource: media.url,
		duration: media.duration,
		chapters: list(raw.chapters || raw.audio?.chapters).slice(0, 8),
		pollOptions: normalizePollOptions(raw),
		participantCount: Number(raw.participantCount || raw.poll?.participantCount || 0),
		graphNodes: normalizeGraphNodes(raw),
		counts: post.counts || {},
		raw
	});
}
