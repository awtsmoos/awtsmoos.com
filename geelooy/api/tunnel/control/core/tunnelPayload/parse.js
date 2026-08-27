// B"H
// Boruch Hashem
// Blessed is He

function queryMap(input = {}) {
	return input.paramKinds?.GET ||
		input.$_GET ||
		{};
}

function from64(value) {
	if (!value) {
		return "";
	}

	return Buffer.from(
		String(value),
		"base64"
	).toString("utf8");
}

function parseJson(value, fallback) {
	if (!value) {
		return fallback;
	}

	if (typeof value === "object") {
		return value;
	}

	try {
		return JSON.parse(String(value));
	} catch {
		return fallback;
	}
}

function parse64(value, fallback) {
	try {
		return parseJson(
			from64(value),
			fallback
		);
	} catch {
		return fallback;
	}
}

function boolValue(value) {
	if (value === true || value === false) {
		return value;
	}

	const text = String(value).toLowerCase();

	if (["true", "1", "yes", "on"].includes(text)) {
		return true;
	}

	if (["false", "0", "no", "off"].includes(text)) {
		return false;
	}

	return undefined;
}

function numberValue(value, fallback, minimum = 0, maximum = Infinity) {
	const number = Number(value);
	const selected = Number.isFinite(number)
		? number
		: fallback;

	return Math.max(
		minimum,
		Math.min(
			maximum,
			selected
		)
	);
}

function mergeDefined(target, source = {}) {
	for (const [key, value] of Object.entries(source || {})) {
		if (
			value !== undefined &&
			value !== null &&
			value !== ""
		) {
			target[key] = value;
		}
	}

	return target;
}

module.exports = {
	boolValue,
	from64,
	mergeDefined,
	numberValue,
	parse64,
	parseJson,
	queryMap
};
