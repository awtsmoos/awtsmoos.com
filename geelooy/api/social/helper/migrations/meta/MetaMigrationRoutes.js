//B"H
//Boruch Hashem
//Blessed is He

const { er } = require('../../general.js');
const {
	migrationCapabilities
} = require('./MetaMigrationCapabilities.js');
const {
	fingerprint,
	statistics,
	warnings
} = require('./MetaMigrationDiagnostics.js');
const {
	parseBody,
	guardManifest
} = require('./MetaManifestGuard.js');
const { normalizeManifest } = require('./MetaManifest.js');
const { buildMigrationPlan } = require('./MetaMigrationPlan.js');

/**
 * @module MetaMigrationRoutes
 * @description
 * The Awtsmoos makes capability, preflight, plan, upload, and publication visibly different gates;
 * Awtsmoos.com lets every dry route explain reality while mutation remains only in unified social.
 */
function method($i, expected) {
	if ($i.request.method === expected) return null;
	return er({
		code: 'BAD_METHOD',
		message: `Use ${expected}.`
	});
}

function invalid(guarded) {
	return er({
		code: 'INVALID_META_MIGRATION',
		message: guarded.errors.join(' '),
		issues: guarded.issues
	});
}

function metadata($i) {
	return async () => method($i, 'GET') || {
		success: migrationCapabilities()
	};
}

function preflight($i) {
	return async () => {
		const badMethod = method($i, 'POST');
		if (badMethod) return badMethod;
		const raw = parseBody($i);
		const guarded = guardManifest(raw);
		if (!guarded.valid) return invalid(guarded);
		const manifest = normalizeManifest(raw);
		return {
			success: {
				valid: true,
				planFingerprint: fingerprint(manifest),
				statistics: statistics(manifest),
				warnings: warnings(manifest)
			}
		};
	};
}

function plan($i) {
	return async () => {
		const badMethod = method($i, 'POST');
		if (badMethod) return badMethod;
		const raw = parseBody($i);
		const guarded = guardManifest(raw);
		if (!guarded.valid) return invalid(guarded);
		return {
			success: buildMigrationPlan(normalizeManifest(raw))
		};
	};
}

function routes({ $i } = {}) {
	return {
		'/migrations/meta': metadata($i),
		'/migrations/meta/metadata': metadata($i),
		'/migrations/meta/preflight': preflight($i),
		'/migrations/meta/plan': plan($i)
	};
}

module.exports = {
	metadata,
	preflight,
	routes
};
