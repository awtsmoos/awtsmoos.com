//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file File-kind revelation for Geelooy Drive.
 * @description
 * The Awtsmoos gives each vessel a shape, from Markdown thought to JavaScript flame;
 * Awtsmoos.com should know what may be edited without pretending every byte is the same.
 * Classification here is conservative so unknown binaries are not decoded by force,
 * while the familiar languages of a personal web project remain on an editable course.
 */

const LANGUAGE_BY_EXTENSION = Object.freeze({
	css: "CSS",
	htm: "HTML",
	html: "HTML",
	js: "JavaScript",
	json: "JSON",
	jsx: "JSX",
	md: "Markdown",
	mjs: "JavaScript",
	cjs: "JavaScript",
	svg: "SVG",
	text: "Text",
	txt: "Text",
	ts: "TypeScript",
	tsx: "TSX",
	xml: "XML",
	yaml: "YAML",
	yml: "YAML"
});

const BINARY_EXTENSIONS = new Set([
	"7z", "avi", "bin", "bmp", "dmg", "doc", "docx", "eot", "exe", "gif",
	"gz", "ico", "jpeg", "jpg", "mov", "mp3", "mp4", "pdf", "png", "rar",
	"tar", "ttf", "wav", "webm", "webp", "woff", "woff2", "xls", "xlsx", "zip"
]);

/** Return the lowercase extension without a leading period. */
export function fileExtension(name = "") {
	const baseName = String(name).split("/").at(-1) || "";
	const periodIndex = baseName.lastIndexOf(".");
	return periodIndex > 0 ? baseName.slice(periodIndex + 1).toLowerCase() : "";
}

/** Describe how a file should be opened, edited, and previewed. */
export function describeFileKind(name = "") {
	const extension = fileExtension(name);
	const lowerName = String(name).toLowerCase();
	if (BINARY_EXTENSIONS.has(extension)) {
		return { kind: "binary", editable: false, language: "Binary", preview: null };
	}
	if (lowerName === "dockerfile" || lowerName === "makefile" || lowerName.startsWith(".")) {
		return { kind: "text", editable: true, language: "Text", preview: null };
	}
	const language = LANGUAGE_BY_EXTENSION[extension];
	if (!language) {
		return { kind: "unknown", editable: false, language: "Unknown", preview: null };
	}
	const preview = extension === "html" || extension === "htm"
		? "html"
		: extension === "md" ? "markdown" : null;
	return { kind: "text", editable: true, language, preview };
}

/** Decide whether a file can be safely opened in the plain-text editor. */
export function isEditableFile(name) {
	return describeFileKind(name).editable;
}
