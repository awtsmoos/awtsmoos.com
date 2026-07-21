// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicFeedArchetype
 * @description
 * The Awtsmoos does not force one garment upon every post. Awtsmoos.com reads
 * verified fields and reveals the fitting source color without inventing content.
 */

/** Selects a specialized renderer only when the data proves the archetype. */
export function resolveArchetype(object) {
	const raw = object.raw || {};
	if (audioSource(raw, object.assets).url) {
		return "audio";
	}
	if (String(object.type).toLowerCase() === "question" || raw.poll) {
		return "question";
	}
	if (
		raw.sourceGraph ||
		Array.isArray(raw.relationships) ||
		graphNodes(raw).length > 1
	) {
		return "source-graph";
	}
	return "reflection";
}

/** Returns visible, non-color-only source metadata for a card. */
export function sourceIdentity(object, archetype = resolveArchetype(object)) {
	const raw = object.raw || {};
	const supplied = String(raw.sourceType || raw.source?.type || "").trim();
	const map = {
		audio: {
			key: "audio",
			label: supplied || "Audio teaching",
			glyph: "♫",
			tone: "magenta"
		},
		question: {
			key: "question",
			label: supplied || "Question open",
			glyph: "?",
			tone: "cyan"
		},
		"source-graph": {
			key: "graph",
			label: supplied || "Source graph",
			glyph: "✦",
			tone: "violet"
		},
		reflection: {
			key: "reflection",
			label: supplied || "Source Torah",
			glyph: "✡",
			tone: "cyan"
		}
	};
	return map[archetype] || map.reflection;
}

/** Extracts an actual audio source or an honest empty descriptor. */
export function audioSource(raw = {}, assets = []) {
	const audioAssets = Array.isArray(assets) ? assets.filter((asset) => {
		const mediaType = String(asset?.mime || asset?.type || "");
		return mediaType.startsWith("audio/") || asset?.kind === "audio";
	}) : [];
	const candidates = [
		raw.audioUrl,
		raw.audio?.url,
		raw.audio?.src,
		raw.mediaType === "audio" ? raw.mediaUrl : "",
		...audioAssets.map((asset) => asset?.url || asset?.src)
	];
	return {
		url: String(candidates.find(Boolean) || ""),
		duration: Number(raw.duration || raw.audio?.duration || 0)
	};
}

/** Extracts supplied poll options without manufacturing choices. */
export function pollOptions(raw = {}) {
	const source = raw.poll?.options || raw.options || raw.choices || [];
	return Array.isArray(source) ? source.filter(Boolean) : [];
}

/** Extracts supplied graph nodes or citations as navigable nodes. */
export function graphNodes(raw = {}) {
	const source = raw.sourceGraph?.nodes ||
		raw.graph?.nodes ||
		raw.nodes ||
		raw.references ||
		raw.citations ||
		[];
	return Array.isArray(source) ? source.filter(Boolean) : [];
}
