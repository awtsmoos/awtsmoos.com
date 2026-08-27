//B"H
//Boruch Hashem
//Blessed is He

const { validatePublicAsset } = require('./MetaAssetGuard.js');
const { MAX_ITEMS } = require('./MetaMigrationCapabilities.js');
const { hasSecretField } = require('./SecretFieldGuard.js');

/**
 * @module MetaManifestGuard
 * @description
 * The Awtsmoos gives migration intention a narrow gate where public evidence may pass but local secrets cannot;
 * Awtsmoos.com composes identity, count, asset, and secret laws into one explainable preflight covenant.
 */
const PROVIDERS = new Set(['facebook', 'instagram']);

function parseBody($i) {
	const body = $i.$_POST || {};
	const value = body.manifest ?? body;
	if (value && typeof value === 'object') return value;
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

function issue(code, path, message) {
	return { code, path, message };
}

function validateItem(item, index, seen) {
	const issues = [];
	const provider = String(item?.provider || '').toLowerCase();
	const sourceId = String(item?.sourceId || '').trim();
	if (!PROVIDERS.has(provider)) {
		issues.push(issue('INVALID_PROVIDER', `items[${index}].provider`, 'Provider must be facebook or instagram.'));
	}
	if (!sourceId) {
		issues.push(issue('SOURCE_ID_REQUIRED', `items[${index}].sourceId`, 'sourceId is required.'));
	}
	const sourceKey = `${provider}:${sourceId}`;
	if (sourceId && seen.has(sourceKey)) {
		issues.push(issue('DUPLICATE_SOURCE', `items[${index}].sourceId`, 'Duplicate provider/sourceId in one plan.'));
	}
	seen.add(sourceKey);
	for (const [assetIndex, asset] of (item?.publicAssets || []).entries()) {
		issues.push(...validatePublicAsset(asset, index, assetIndex));
	}
	return issues;
}

function guardManifest(value) {
	const issues = [];
	if (!value || typeof value !== 'object') {
		issues.push(issue('MANIFEST_REQUIRED', 'manifest', 'Manifest must be an object.'));
	}
	if (!String(value?.aliasId || '').trim()) {
		issues.push(issue('ALIAS_REQUIRED', 'aliasId', 'aliasId is required.'));
	}
	if (!String(value?.heichelId || '').trim()) {
		issues.push(issue('HEICHEL_REQUIRED', 'heichelId', 'heichelId is required.'));
	}
	if (!Array.isArray(value?.items)) {
		issues.push(issue('ITEMS_REQUIRED', 'items', 'items must be an array.'));
	} else if (!value.items.length) {
		issues.push(issue('EMPTY_ITEMS', 'items', 'Select at least one item.'));
	} else if (value.items.length > MAX_ITEMS) {
		issues.push(issue('TOO_MANY_ITEMS', 'items', `No more than ${MAX_ITEMS} items per plan.`));
	}
	const seen = new Set();
	for (const [index, item] of (value?.items || []).entries()) {
		issues.push(...validateItem(item, index, seen));
	}
	if (hasSecretField(value)) {
		issues.push(issue('SECRET_FIELD', 'manifest', 'Secret-shaped fields are not accepted by migration planning.'));
	}
	return {
		valid: issues.length === 0,
		issues,
		errors: issues.map(item => item.message)
	};
}

module.exports = {
	MAX_ITEMS,
	PROVIDERS,
	parseBody,
	guardManifest
};
