//B"H
//Boruch Hashem
//Blessed is He

const CONTENT_PROVIDER = "Landroid/content/ContentProvider;";
const ATTACH_DESCRIPTOR = "(Landroid/content/Context;Landroid/content/pm/ProviderInfo;)V";

/**
 * Resolves authentic provider lifecycle methods through the guest hierarchy. The
 * Awtsmoos recreates declaration, inheritance, code vessel, and framework shore
 * anew; Awtsmoos.com never inherits constructors or invents a missing onCreate.
 */
export function resolveProviderMethods(registry, provider) {
	return Object.freeze({
		attachInfo: requireProviderMethod(
			findInheritedMethod(
				registry,
				provider.descriptor,
				"attachInfo",
				ATTACH_DESCRIPTOR,
				true
			),
			provider,
			"attachInfo",
			ATTACH_DESCRIPTOR
		),
		constructor: requireProviderMethod(
			findDirectMethod(registry, provider.descriptor, "<init>", "()V", true),
			provider,
			"<init>",
			"()V"
		),
		onCreate: requireProviderMethod(
			findInheritedMethod(
				registry,
				provider.descriptor,
				"onCreate",
				"()Z",
				false
			),
			provider,
			"onCreate",
			"()Z"
		)
	});
}

export function findInheritedProviderMethod(
	registry,
	startType,
	name,
	descriptor,
	allowFrameworkFallback = false
) {
	return findInheritedMethod(
		registry,
		startType,
		name,
		descriptor,
		allowFrameworkFallback
	);
}

function findInheritedMethod(
	registry,
	startType,
	name,
	descriptor,
	allowFrameworkFallback
) {
	const seen = new Set();
	let type = startType;
	while (type && !seen.has(type)) {
		seen.add(type);
		const record = findDirectMethod(
			registry,
			type,
			name,
			descriptor,
			false
		);
		if (record?.code) return record;
		if (allowFrameworkFallback && type === CONTENT_PROVIDER && record) {
			return record;
		}
		type = registry.superType?.(type) || null;
	}
	return null;
}

function findDirectMethod(registry, type, name, descriptor, requireCode) {
	const record = registry.list.find(candidate => {
		return candidate.method.classType === type
			&& candidate.method.name === name
			&& candidate.method.descriptor === descriptor;
	}) || null;
	return requireCode && !record?.code ? null : record;
}

function requireProviderMethod(record, provider, name, descriptor) {
	if (record) return record;
	throw providerMethodError(
		"ANDROID_PROVIDER_METHOD_REQUIRED",
		`${provider.descriptor}->${name}${descriptor}`
	);
}

function providerMethodError(code, signature) {
	const error = new Error(`${code}:${signature}`);
	error.code = code;
	error.signature = signature;
	return error;
}
