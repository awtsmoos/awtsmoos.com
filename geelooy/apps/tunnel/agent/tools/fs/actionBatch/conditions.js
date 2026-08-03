// B"H
// Boruch Hashem
// Blessed is He

const Payload = require("./payload.js");
const Resolution = require("./valueResolution.js");

function compare(operator, actual, expected, context) {
	const operations = {
		truthy: (value) => Boolean(value),
		falsy: (value) => !value,
		exists: (value) => value !== undefined && value !== null,
		missing: (value) => value === undefined || value === null,
		ok: (value) => (value ?? context.last)?.ok !== false,
		failed: (value) => (value ?? context.last)?.ok === false,
		eq: (left, right) => left === right,
		ne: (left, right) => left !== right,
		gt: (left, right) => left > right,
		gte: (left, right) => left >= right,
		lt: (left, right) => left < right,
		lte: (left, right) => left <= right,
		includes: (left, right) => Array.isArray(left)
			? left.includes(right)
			: String(left || "").includes(String(right || "")),
		regex: (left, right) => new RegExp(String(right)).test(String(left || ""))
	};
	try {
		return Boolean((operations[operator] || operations.truthy)(actual, expected));
	} catch {
		return false;
	}
}

async function evaluateCondition(condition, context, runAction) {
	const parsed = Payload.parseJson(condition, condition);
	if (parsed === true) return true;
	if (!parsed) return false;
	if (Array.isArray(parsed.all)) {
		for (const item of parsed.all) {
			if (!await evaluateCondition(item, context, runAction)) return false;
		}
		return true;
	}
	if (Array.isArray(parsed.any)) {
		for (const item of parsed.any) {
			if (await evaluateCondition(item, context, runAction)) return true;
		}
		return false;
	}
	if (parsed.not) {
		return !await evaluateCondition(parsed.not, context, runAction);
	}
	const actual = await resolveActual(parsed, context, runAction);
	const operator = conditionOperator(parsed);
	const expected = parsed[operator] !== undefined
		? await Resolution.resolveValue(parsed[operator], context, runAction)
		: await Resolution.resolveValue(parsed.right, context, runAction);
	return compare(operator, actual, expected, context);
}

async function resolveActual(parsed, context, runAction) {
	if (!parsed.path) {
		return Resolution.resolveValue(parsed.left, context, runAction);
	}
	const path = String(parsed.path).startsWith("$")
		? parsed.path
		: `$ctx.${parsed.path}`;
	return Resolution.resolveValue(path, context, runAction);
}

function conditionOperator(parsed) {
	const candidates = [
		"eq", "ne", "gt", "gte", "lt", "lte", "includes", "regex",
		"truthy", "falsy", "exists", "missing", "ok", "failed"
	];
	return parsed.operator || parsed.op ||
		Object.keys(parsed).find((key) => candidates.includes(key)) ||
		"truthy";
}

module.exports = {
	evaluateCondition
};
