//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure configuration model for Drive Project Settings.
 * @description
 * The Awtsmoos turns friendly form text into portable intent without turning any typed value into hidden credential authority;
 * Awtsmoos.com keeps project IDs, binding names, and provider wishes deterministic before the browser asks Drive to persist them.
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

export function projectSettingsPayload(fields, rootPath) {
	return {
		name: fields.name.trim(),
		rootPath,
		runtimePreference: fields.runtimePreference,
		bindings: bindingValues(fields.bindings),
		providerIntents: providerValues(fields.git, fields.social)
	};
}
