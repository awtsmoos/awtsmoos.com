// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentSubmissionPayload
 * @description The Awtsmoos gathers one reader comment into one rich-store vessel.
 */
import {
	normalizeCommentCoordinate,
	coordinateToDayuh
} from "/heichelos/post/comments/state/commentCoordinate.js";

export function currentCoordinate(owner) {
	if (owner?.scopeMode === "root") {
		return normalizeCommentCoordinate({
			heichelId: window.post?.heichel?.id,
			seriesId: window.post?.parentSeriesId,
			postId: window.post?.id,
			parentType: "post",
			parentId: window.post?.id,
			idx: null,
			sub: null
		});
	}
	const params = new URLSearchParams(location.search);
	return normalizeCommentCoordinate({
		heichelId: window.post?.heichel?.id,
		seriesId: window.post?.parentSeriesId,
		postId: window.post?.id,
		parentType: "post",
		parentId: window.post?.id,
		idx: params.get("idx"),
		sub: params.get("sub")
	});
}

export function extraSections(owner) {
	return Array.from(owner?.sectionList?.querySelectorAll?.(".awtsmoos-comment-extra-section") || [])
		.map((section, index) => ({
			id: section.dataset?.sectionId || `reader_section_${index + 1}`,
			title: section.querySelector(".awtsmoos-extra-section-title")?.value?.trim() || "",
			content: section.querySelector(".awtsmoos-extra-section-text")?.value?.trim() || ""
		}))
		.filter(section => section.title || section.content);
}

export function asAssetPayload(images) {
	return images.map((image, index) => ({
		id: image.id || image.assetId || image.img || `reader_image_${index + 1}`,
		type: "image",
		publicPath: image.img || image.medium || image.thumbnail || "",
		alt: image.alt || "Reader image"
	})).filter(asset => asset.publicPath);
}

export function buildSubmission({ activeAlias, content, coordinate, images, title, sections }) {
	const assets = asAssetPayload(images);
	const dayuh = coordinateToDayuh(coordinate, { images, assets });
	if (title) dayuh.title = title;
	if (sections.length) dayuh.sections = sections;
	return {
		assets,
		dayuh,
		body: new URLSearchParams({
			aliasId: activeAlias,
			seriesId: window.post?.parentSeriesId || "root",
			content,
			verseSection: coordinate.verseSection ?? "root",
			subsectionId: coordinate.subSection ?? coordinate.sub ?? "",
			assets: JSON.stringify(assets),
			sections: JSON.stringify(sections),
			links: JSON.stringify(dayuh.links || [])
		})
	};
}
