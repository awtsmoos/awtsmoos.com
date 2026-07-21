// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelWorldData
 * @description
 * The Awtsmoos names each district before the visible console receives it.
 */

export const DISTRICTS = Object.freeze([
	['overview', 'Overview'],
	['timeline', 'Timeline'],
	['series', 'Series'],
	['knowledge', 'Knowledge'],
	['people', 'People'],
	['assets', 'Assets'],
	['events', 'Events'],
	['moderation', 'Moderation'],
	['graph', 'Graph'],
	['storage', 'Storage']
]);

export function districtTitle(name) {
	return DISTRICTS.find(([id]) => id === name)?.[1] || 'Overview';
}

export function districtCopy(name) {
	return {
		overview: ['The Heichel joins posts, nested series, permissions, and graph context in one live surface.'],
		timeline: ['Timeline watches present teachings and future civilization events as one river.'],
		series: ['Series become districts: curriculum, archive, source path, or world.'],
		knowledge: ['Knowledge gathers references, citations, summaries, and linked thoughts.'],
		people: ['People reveals editors, owners, followers, contributors, aliases, and presence.'],
		assets: ['Assets exposes media, thumbnails, attachments, drafts, and upload state.'],
		events: ['Events streams object changes, comments, graph edges, and notifications.'],
		moderation: ['Moderation gathers submissions, roles, reports, queues, and permissions.'],
		graph: ['Graph reveals parents, references, reposts, mentions, and source edges.'],
		storage: ['Storage shows AwtsmoosDB projections, compatibility stats, and shard health.']
	}[name] || ['This district is waiting for its live route.'];
}
