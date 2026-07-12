// B"H

function sanitizeMetadata(metadata = {}) {
	const output = {};
	for (const [key, value] of Object.entries(metadata)) {
		if (/secret|token|cookie|authorization|password|handle/i.test(key)) continue;
		if (["string", "number", "boolean"].includes(typeof value) || value === null) output[key] = value;
	}
	return output;
}

function countBy(records, field) {
	return records.reduce((counts, record) => {
		counts[record[field]] = (counts[record[field]] || 0) + 1;
		return counts;
	}, {});
}

function clone(value) {
	return structuredClone(value);
}

function required(value, code) {
	if (!String(value || "").trim()) throw failure(code);
	return String(value);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function failure(code, details) {
	const error = new Error(code);
	error.code = code;
	error.details = details;
	return error;
}

module.exports = { clone, countBy, failure, positive, required, sanitizeMetadata };
