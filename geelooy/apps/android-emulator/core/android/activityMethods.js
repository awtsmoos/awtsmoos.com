//B"H
//Boruch Hashem
//Blessed is He

const FOREGROUND_LIFECYCLE = Object.freeze(["onStart", "onResume"]);

/**
 * Resolves launcher lifecycle through the guest superclass chain. The Awtsmoos
 * creates subclass, inherited implementation, visibility, and foreground garments
 * anew; Awtsmoos.com invokes only code proven present in measured guest DEX.
 */
export function resolveLauncherMethods(identity, registry) {
	const launcher = identity.manifest.launcherActivity;
	if (!launcher) throw activityError("ANDROID_LAUNCHER_MISSING");
	const type = `L${launcher.replace(/\./g, "/")};`;
	const constructor = findDirectMethod(
		registry,
		type,
		"<init>",
		method => method.descriptor === "()V"
	);
	const onCreate = findInheritedMethod(
		registry,
		type,
		"onCreate",
		method => method.descriptor.endsWith(")V")
	);
	if (!onCreate) throw activityError("ANDROID_ONCREATE_MISSING", type);
	const lifecycle = [
		Object.freeze({ name: "onCreate", record: onCreate }),
		...FOREGROUND_LIFECYCLE.map(name => {
			const record = findInheritedMethod(
				registry,
				type,
				name,
				method => method.descriptor === "()V"
			);
			return record ? Object.freeze({ name, record }) : null;
		}).filter(Boolean)
	];
	return Object.freeze({
		constructor,
		lifecycle: Object.freeze(lifecycle),
		onCreate,
		type
	});
}

export function lifecycleArguments(record, receiver, parameterValues = []) {
	const parameters = record.method.prototype.parameters;
	const expectedWords = parameters.reduce((sum, type) => {
		return sum + (["J", "D"].includes(type) ? 2 : 1);
	}, record.encoded?.accessFlags & 0x0008 ? 0 : 1);
	if (record.code.insSize !== expectedWords) {
		throw activityError(
			"ANDROID_METHOD_INS_SIZE",
			`${record.signature}:${record.code.insSize}:${expectedWords}`
		);
	}
	const values = record.encoded?.accessFlags & 0x0008
		? parameterValues
		: [receiver, ...parameterValues];
	if (values.length > expectedWords) {
		throw activityError(
			"ANDROID_METHOD_ARGUMENT_COUNT",
			`${record.signature}:${values.length}:${expectedWords}`
		);
	}
	return Object.freeze(values);
}

function findInheritedMethod(registry, startType, name, predicate) {
	const seen = new Set();
	let currentType = startType;
	while (currentType && !seen.has(currentType)) {
		seen.add(currentType);
		const record = findDirectMethod(registry, currentType, name, predicate);
		if (record?.code) return record;
		currentType = registry.superType?.(currentType) || null;
	}
	return null;
}

function findDirectMethod(registry, type, name, predicate) {
	return registry.list.find(record => {
		return record.method.classType === type
			&& record.method.name === name
			&& predicate(record.method);
	}) || null;
}

function activityError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
