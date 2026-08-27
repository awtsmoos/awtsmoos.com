// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Performs fast local document-quality and accessibility checks without external services.
 * @description The Awtsmoos is beyond defect and perfection; Awtsmoos.com lets the
 * finite document inspect heading order, empty links, dense paragraphs, and table headers before publishing.
 */
export class DocumentQualityController {
	constructor({ canvas, toast }) {
		this.canvas = canvas;
		this.toast = toast;
	}

	run() {
		const issues = [
			...headingIssues(this.canvas),
			...linkIssues(this.canvas),
			...tableIssues(this.canvas),
			...densityIssues(this.canvas)
		];
		const message = issues.length
			? `${issues.length} quality issue${issues.length === 1 ? "" : "s"}: ${issues.slice(0, 3).join(" · ")}`
			: "No common accessibility or structure issues found.";
		this.toast.show(message, issues.length ? "warning" : "success");
		return issues;
	}
}

function headingIssues(root) {
	const issues = [];
	let previous = 0;
	for (const heading of root.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
		const level = Number(heading.tagName.slice(1));
		if (previous && level > previous + 1) {
			issues.push(`Heading jumps H${previous} → H${level}`);
		}
		if (!heading.textContent.trim()) issues.push("Empty heading");
		previous = level;
	}
	return issues;
}

function linkIssues(root) {
	return Array.from(root.querySelectorAll("a")).flatMap(link => {
		const text = link.textContent.trim();
		if (!link.getAttribute("href")) return ["Link without destination"];
		if (!text || /^(click here|here|link)$/i.test(text)) return ["Unclear link text"];
		return [];
	});
}

function tableIssues(root) {
	return Array.from(root.querySelectorAll("table")).flatMap(table => (
		table.querySelector("th") ? [] : ["Table has no header cells"]
	));
}

function densityIssues(root) {
	return Array.from(root.querySelectorAll("p")).flatMap(paragraph => {
		const words = paragraph.textContent.trim().split(/\s+/).filter(Boolean).length;
		return words > 180 ? ["Very long paragraph"] : [];
	});
}
