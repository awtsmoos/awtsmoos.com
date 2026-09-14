//B"H
//Boruch Hashem
//Blessed be He

const crypto = require("crypto");
const fs = require("fs");
const awts = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON");
const { ANNOTATIONS } = require("./config.cjs");

/**
 * @file Safe normalizer for recovered Torah commentary rows.
 * @description Stored HTML is reduced to text while dibur-hamatchil and paragraph structure remain distinct.
 */
function stripTags(value) {
	return String(value ?? "")
		.replace(/<br\s*\/?>/gi, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;|&apos;/gi, "'")
		.replace(/\s+/g, " ")
		.trim();
}

function textArray(value) {
	if (Array.isArray(value)) return value.map(stripTags).filter(Boolean);
	if (value && typeof value === "object") {
		const body = value.text ?? value.paragraphs ?? value.content ?? value.sections;
		return textArray(body);
	}
	const text = stripTags(value);
	return text ? [text] : [];
}

function titleAndParagraphs(row = {}) {
	const content = row.content;
	if (content && typeof content === "object" && !Array.isArray(content)) {
		return {
			title: stripTags(content.title || row.title || row.dayuh?.title || ""),
			paragraphs: textArray(content.text ?? content.content ?? content.paragraphs)
		};
	}
	const sections = Array.isArray(row.dayuh?.sections) ? row.dayuh.sections : [];
	const first = stripTags(sections[0] || "");
	const firstWasHeading = /<h[1-6][^>]*>/i.test(String(sections[0] || ""));
	const paragraphs = firstWasHeading ? sections.slice(1).map(stripTags).filter(Boolean) : textArray(content || sections);
	return {
		title: stripTags(row.title || row.dayuh?.title || (firstWasHeading ? first : "")),
		paragraphs
	};
}

function deterministicId(context, title, paragraphs) {
	const hash = crypto.createHash("sha256")
		.update([context.aliasId, context.seriesId, context.postId, context.verseSection, title, ...paragraphs].join("\u001f"))
		.digest("hex")
		.slice(0, 24);
	return `BH_source_${context.aliasId}_${hash}`;
}

function timestampFromId(id) {
	const number = Number(String(id || "").match(/(?:BH_|c_)(\d{10,})/)?.[1]);
	return Number.isFinite(number) ? number : 0;
}

function normalizeRow(row, context) {
	const policy = ANNOTATIONS[context.aliasId];
	const { title, paragraphs } = titleAndParagraphs(row);
	if (!policy || (!title && paragraphs.length === 0)) return null;
	const verseSection = Number(row?.dayuh?.verseSection ?? row?.verseSection ?? context.verseSection);
	if (!Number.isInteger(verseSection) || verseSection < 0) return null;
	const id = deterministicId({ ...context, verseSection }, title, paragraphs);
	const createdAt = timestampFromId(row?.id);
	return {
		id,
		heichelId: "ikar",
		seriesId: context.seriesId,
		postId: context.postId,
		entityId: context.postId,
		parentId: "",
		parentType: "entity",
		aliasId: context.aliasId,
		author: context.aliasId,
		verseSection: String(verseSection),
		subsectionId: "",
		content: { title, text: paragraphs },
		createdAt,
		updatedAt: createdAt,
		deleted: false,
		dayuh: {
			verseSection,
			title,
			torahAnnotation: {
				kind: policy.kind,
				language: policy.language,
				name: policy.name,
				sourceId: context.sourceId,
				coordinateBasis: "reader-zero-based"
			}
		}
	};
}

function decodeFile(file) {
	const raw = fs.readFileSync(file);
	if (raw.length <= 1) return null;
	return awts.deserializeBinary(raw);
}

module.exports = { decodeFile, normalizeRow, stripTags, textArray, titleAndParagraphs };
