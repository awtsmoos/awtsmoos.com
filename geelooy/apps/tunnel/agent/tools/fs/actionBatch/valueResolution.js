// B"H
// Boruch Hashem
// Blessed is He

function getPath(target, path) {
	return String(path || "")
		.split(".")
		.filter(Boolean)
		.reduce((value, key) => value?.[key], target);
}

function interpolate(text, context) {
	return String(text).replace(
		/\$(ctx|vars)\.([A-Za-z0-9_.-]+)/g,
		(_match, root, key) => {
			const source = root === "ctx" ? context : context.vars;
			return String(getPath(source, key) ?? "");
		}
	);
}

async function resolveActionReference(value, mode, runAction) {
	const [, actionId, ...rest] = value.split(".");
	const response = await runAction({
		action: "actionHistoryGet",
		actionId
	});
	const base = mode === "output"
		? response.record && response.record.output
		: response.record;
	return rest.length ? getPath(base, rest.join(".")) : base;
}

async function resolveValue(value, context, runAction) {
	if (typeof value === "string" && value.startsWith("$ctx.")) {
		return getPath(context, value.slice(5));
	}
	if (typeof value === "string" && value.startsWith("$vars.")) {
		return getPath(context.vars, value.slice(6));
	}
	if (typeof value === "string" && /\$(ctx|vars)\.[A-Za-z0-9_.-]+/.test(value)) {
		return interpolate(value, context);
	}
	if (typeof value === "string" && value.startsWith("$action.")) {
		return resolveActionReference(value, "record", runAction);
	}
	if (typeof value === "string" && value.startsWith("$result.")) {
		return resolveActionReference(value, "output", runAction);
	}
	if (Array.isArray(value)) {
		return Promise.all(value.map((item) => resolveValue(item, context, runAction)));
	}
	if (value && typeof value === "object") {
		return resolvePayload(value, context, runAction);
	}
	return value;
}

async function resolvePayload(value, context, runAction) {
	if (Array.isArray(value)) {
		return Promise.all(value.map((item) => {
			return resolvePayload(item, context, runAction);
		}));
	}
	if (!value || typeof value !== "object") {
		return resolveValue(value, context, runAction);
	}
	const output = {};
	for (const [key, item] of Object.entries(value)) {
		output[key] = await resolveValue(item, context, runAction);
	}
	return output;
}

module.exports = {
	getPath,
	resolvePayload,
	resolveValue
};
