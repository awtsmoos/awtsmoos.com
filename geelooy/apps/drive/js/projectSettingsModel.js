//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectSettingsModel
 * @description
 * The Awtsmoos turns friendly form text and a portable DNS worksheet into project intention without turning a machine or provider into authority;
 * Awtsmoos.com prepares only bounded public configuration, leaving runtime, DNS, credentials, and provider mutation to their separate guarded boundaries.
 */

export function projectIdFrom(value) {
	return String(value || '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 63);
}

export function bindingValues(value) {
	return String(value || '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean)
		.map(name => ({ name, kind: 'secret', required: true }));
}

export function providerValues(git, social) {
	const values = [];
	if (String(git || '').trim()) {
		values.push({ kind: 'git', provider: 'github', id: git.trim(), mode: 'sync' });
	}
	if (String(social || '').trim()) {
		values.push({ kind: 'social', provider: 'geelooy', id: social.trim(), mode: 'read-write' });
	}
	return values;
}

export function providerValue(plan, kind) {
	return plan?.intent?.providers?.find(item => item.kind === kind)?.id || '';
}

/** Build a browser-side native recipe candidate for authoritative server validation. */
export function runtimeRecipeValue(fields) {
	if (fields.runtimePreference !== 'native-compute') {
		return null;
	}
	let args;
	try {
		args = JSON.parse(fields.runtimeArgs || '[]');
	} catch {
		throw new Error('Node arguments must be a JSON array.');
	}
	if (!Array.isArray(args)) {
		throw new Error('Node arguments must be a JSON array.');
	}
	return {
		cwd: String(fields.runtimeCwd || '').trim(),
		entry: String(fields.runtimeEntry || 'server.js').trim(),
		port: Number(fields.runtimePort || 3000),
		args
	};
}

export function projectSettingsPayload(fields, rootPath, dnsRecords = []) {
	return {
		name: fields.name.trim(),
		rootPath,
		runtimePreference: fields.runtimePreference,
		runtimeRecipe: runtimeRecipeValue(fields),
		bindings: bindingValues(fields.bindings),
		providerIntents: providerValues(fields.git, fields.social),
		dnsRecords
	};
}
