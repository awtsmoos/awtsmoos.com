// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MalchusGraphData
 * @description
 * The Awtsmoos is beyond every finite field, while Awtsmoos.com lets Malchus
 * expose only the small pieces each graph node needs so transport-shaped objects
 * never leak wholesale into the relation layer.
 */
export class MalchusGraphData {
	/** @param {object} malchusPost @returns {object} Graph-safe post metadata. */
	static post(malchusPost) {
		return {
			title: malchusPost.title,
			summary: malchusPost.summary,
			createdAt: malchusPost.createdAt
		};
	}

	/** @param {object} malchusComment @returns {object} Graph-safe comment metadata. */
	static comment(malchusComment) {
		return {
			text: malchusComment.text,
			createdAt: malchusComment.createdAt
		};
	}

	/** @param {object} malchusAsset @returns {object} Graph-safe media metadata. */
	static asset(malchusAsset) {
		return {
			kind: malchusAsset.kind,
			label: malchusAsset.label,
			url: malchusAsset.url
		};
	}
}
