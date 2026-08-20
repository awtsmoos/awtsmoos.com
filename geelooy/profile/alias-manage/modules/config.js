// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasStudioConfig
 * @description
 * The Awtsmoos gives the identity studio one truthful covenant. Awtsmoos.com
 * reads mode, alias, return path, and bootstrap detail without scattering globals.
 */

/** Reads server bootstrap and URL intent into one stable configuration. */
export function getAliasStudioConfig(root = document) {
	const studio = root.querySelector('[data-alias-studio]');
	const bootstrap = readBootstrap(studio?.dataset.bootstrap);
	const params = new URLSearchParams(location.search);
	const alias = params.get('alias') || bootstrap.alias || '';
	const action = params.get('action') || bootstrap.action || 'create';
	const returnURL = params.get('returnURL') || bootstrap.returnURL || '/profile';
	return {
		studio,
		alias,
		action,
		isUpdate: action === 'update' && Boolean(alias),
		returnURL,
		details: bootstrap.details || {},
		endpoint: `${location.origin}/api/social/aliases${alias ? `/${encodeURIComponent(alias)}` : ''}`
	};
}

/** Collects the stable DOM references used by small identity modules. */
export function getAliasStudioRefs(root = document) {
	return {
		form: root.getElementById('alias-form'),
		name: root.getElementById('alias-name'),
		description: root.getElementById('alias-description'),
		aliasId: root.getElementById('alias-id'),
		validation: root.getElementById('id-validation'),
		status: root.getElementById('alias-form-status'),
		submit: root.querySelector('[data-alias-submit]'),
		deleteButton: root.getElementById('delete'),
		deletePanel: root.querySelector('[data-delete-confirm]'),
		deleteConfirm: root.querySelector('[data-delete-confirm-action]'),
		deleteCancel: root.querySelector('[data-delete-cancel]'),
		previewName: root.querySelector('[data-preview-name]'),
		previewHandle: root.querySelector('[data-preview-handle]'),
		previewDescription: root.querySelector('[data-preview-description]'),
		previewAvatar: root.querySelector('[data-preview-avatar]'),
		descriptionCount: root.querySelector('[data-description-count]'),
		previewDetails: root.querySelector('[data-preview-details]')
	};
}

function readBootstrap(encoded = '') {
	if (!encoded) {
		return {};
	}
	try {
		return JSON.parse(decodeURIComponent(encoded));
	} catch {
		return {};
	}
}
