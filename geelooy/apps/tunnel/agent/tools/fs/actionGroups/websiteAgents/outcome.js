// B"H

function analyze(answer = "") {
	const text = String(answer || "").trim();
	const sections = parseSections(text);
	const status = String(sections.STATUS || "").trim();
	const next = String(sections.NEXT || "").trim();
	const explicitUnfinished = /\b(unfinished|incomplete|blocked|working|continue|remaining|needs? attention)\b/i
		.test(`${status}\n${next}`);
	const explicitComplete = /\b(complete|completed|done|finished|verified|passed)\b/i
		.test(status);
	return {
		complete: explicitComplete && !explicitUnfinished,
		status: status || "unspecified",
		next,
		files: lines(sections.FILES),
		roomMessage: String(sections["MESSAGE TO ROOM"] || "").trim(),
		findings: String(sections.FINDINGS || "").trim(),
		hasStructuredStatus: Boolean(status),
		answerPreview: text.slice(0, 12000)
	};
}

function parseSections(text) {
	const names = ["STATUS", "FINDINGS", "FILES", "MESSAGE TO ROOM", "NEXT"];
	const pattern = new RegExp(`^(${names.join("|")}):?\\s*$`, "gmi");
	const matches = [...String(text || "").matchAll(pattern)];
	const result = {};
	for (let index = 0; index < matches.length; index += 1) {
		const current = matches[index];
		const start = current.index + current[0].length;
		const end = matches[index + 1]?.index ?? text.length;
		result[current[1].toUpperCase()] = text.slice(start, end).trim();
	}
	return result;
}

function lines(value) {
	return String(value || "")
		.split(/\r?\n/)
		.map(item => item.replace(/^\s*[-*]\s*/, "").trim())
		.filter(Boolean)
		.slice(0, 100);
}

module.exports = { analyze, parseSections };
