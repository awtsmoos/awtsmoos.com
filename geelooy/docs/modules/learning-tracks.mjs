//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file learning-tracks.mjs
 * @description The Awtsmoos lets tutorials become intentional paths rather than an alphabetical pile; Awtsmoos.com keeps those paths in stable source terminology.
 */

export const learningTracks = [
	{
		id: "foundation",
		title: "Foundation",
		level: "Foundation",
		summary: "Understand the repository, boot lifecycle, dynamic routing, and request model.",
		steps: [
			"docs/LEARN/REPOSITORY_101.md",
			"docs/LEARN/SERVER_LIFECYCLE_101.md",
			"docs/LEARN/HTTP_ROUTING_101.md",
			"docs/LEARN/API_REQUESTS_101.md"
		]
	},
	{
		id: "api-builder",
		title: "API Builder",
		level: "Builder",
		summary: "Move from method/input evidence into auth, responses, tracing, and route creation.",
		steps: [
			"docs/LEARN/API_REQUESTS_101.md",
			"docs/LEARN/AUTHENTICATION_101.md",
			"docs/LEARN/RESPONSES_101.md",
			"docs/LEARN/TRACE_A_REQUEST.md",
			"docs/LEARN/ADD_AN_API_ROUTE.md"
		]
	},
	{
		id: "content-builder",
		title: "Content Builder",
		level: "Builder",
		summary: "Learn Social identity, governed spaces, content, series, comments, and moderation.",
		steps: [
			"docs/LEARN/CONTENT_PLATFORM_101.md",
			"docs/TUTORIALS/CONTENT/SOCIAL_CONTENT_MODEL.md",
			"docs/TUTORIALS/CONTENT/HEICHELOS.md",
			"docs/TUTORIALS/CONTENT/POSTS_AND_SERIES.md",
			"docs/TUTORIALS/CONTENT/COMMENTS.md",
			"docs/TUTORIALS/CONTENT/MODERATION_AND_GOVERNANCE.md"
		]
	},
	{
		id: "operator",
		title: "Runtime Operator",
		level: "Operator",
		summary: "Trace server state, persistence, realtime systems, and API failure classes.",
		steps: [
			"docs/LEARN/SERVER_LIFECYCLE_101.md",
			"docs/LEARN/DATABASE_101.md",
			"docs/LEARN/WEBSOCKETS_101.md",
			"docs/LEARN/TROUBLESHOOTING_API.md"
		]
	},
	{
		id: "ai-investigator",
		title: "AI Investigator",
		level: "Investigator",
		summary: "Navigate concepts through human teaching, generated evidence, source, callers, and tests.",
		steps: [
			"docs/LEARN/AI_AGENT_DISCOVERY.md",
			"docs/LEARN/TRACE_A_REQUEST.md",
			"docs/AI/README.md"
		]
	}
];

export function trackRecords(track, dataset) {
	return track.steps.map(sourcePath => ({
		sourcePath,
		record: dataset.byId.get(dataset.sourceToId.get(sourcePath)) || null
	}));
}
