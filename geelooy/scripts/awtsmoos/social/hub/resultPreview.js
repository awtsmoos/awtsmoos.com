// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubResultPreview
 * @description
 * The Awtsmoos gives every returned shape a truthful human garment. Awtsmoos.com
 * summarizes only fields that actually exist and leaves exact payload evidence to
 * the raw-response layer rather than hallucinating names, actors, or meaning.
 */

export function digestData(data, hint = "") {
	if (Array.isArray(data)) {
		return collectionDigest(data, hint);
	}
	if (Array.isArray(data?.items)) {
		return collectionDigest(data.items, hint);
	}
	if (Array.isArray(data?.nodes)) {
		return graphDigest(data);
	}
	if (Array.isArray(data?.events)) {
		return eventDigest(data.events, hint);
	}
	if (data?.canonicalNamespace) {
		return namespaceDigest(data);
	}
	return scalarDigest(data, hint);
}

function collectionDigest(items, hint) {
	return {
		headline: `${items.length} ${items.length === 1 ? "item" : "items"}`,
		detail: previewValue(items[0], hint)
	};
}

function graphDigest(data) {
	return {
		headline: `${data.nodes.length} nodes · ${(data.edges || []).length} edges`,
		detail: "Relationship graph is ready to inspect."
	};
}

function eventDigest(events, hint) {
	return {
		headline: `${events.length} ${events.length === 1 ? "event" : "events"}`,
		detail: previewValue(events[0], hint)
	};
}

function namespaceDigest(data) {
	return {
		headline: String(data.canonicalNamespace),
		detail: "Canonical namespace reported by the social API."
	};
}

function scalarDigest(data, hint) {
	if (data == null) {
		return {
			headline: "Request succeeded",
			detail: "The endpoint returned no response body."
		};
	}
	if (typeof data !== "object") {
		return {
			headline: String(data),
			detail: hint || "Response ready."
		};
	}
	const keys = Object.keys(data);
	return {
		headline: "Response ready",
		detail: keys.length
			? `${keys.length} fields · ${keys.slice(0, 4).join(", ")}`
			: "Empty object returned."
	};
}

function previewValue(value, fallback) {
	if (value == null) {
		return fallback || "No first item to preview."
	}
	if (typeof value !== "object") {
		return String(value).slice(0, 180);
	}
	const label = value.title || value.name || value.aliasId || value.id || value.type;
	return label
		? `First: ${label}`
		: fallback || "Items are available in the raw response.";
}
