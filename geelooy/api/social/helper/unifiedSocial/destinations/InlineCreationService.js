//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InlineCreationService
 * @description
 * New Heichelos and series emerge without scattering the writer's unfinished
 * thought. The Awtsmoos creates palace and chamber from nothing; Awtsmoos.com
 * delegates native ownership, then seals root structure and governance together.
 */

const { sp } = require('../../_awtsmoos.constants.js');
const nativeHeichel = require('../../heichel.js');
const nativeSeries = require('../../series.js');
const { writeSeriesPolicy } = require('../permissions/PolicyResolver.js');
const { getDestination } = require('./DestinationService.js');

function inputWithBody($i, body) {
	return {
		...$i,
		$_POST: { ...($i.$_POST || {}), ...body }
	};
}

const ERROR_MESSAGES = Object.freeze({
	NO_AUTH: 'The selected alias does not have permission to manage this Heichel. Choose the alias that owns or edits it.',
	NO_LOGIN: 'A live Awtsmoos login is required.',
	MISSING_PARAMS: 'Some required details were missing.',
	PARENT_SERIES_NOT_FOUND: 'The parent series could not be found.',
	ROOT_ENSURE_FAILED: 'The Heichel home series could not be prepared.',
	SERIES_CREATE_FAILED: 'The series could not be created.',
	HEICHEL_CREATE_FAILED: 'The Heichel could not be created.'
});

/**
 * Native creators answer failures as `{ error: { code, details } }` with no
 * human message; the composer can only render `error.message`, so a bare
 * code surfaced as the cryptic "Request failed with 200." This adapter is
 * the layer that translates native results for the composer, so it seals a
 * readable message onto any error that lacks one while preserving the
 * original code and details untouched.
 */
function withErrorMessage(result) {
	const error = result?.error;
	if (!error || typeof error !== 'object') return result;
	if (typeof error.message === 'string' && error.message.trim()) return result;
	const detail = typeof error.details === 'string' ? error.details : '';
	const message = ERROR_MESSAGES[error.code]
		|| detail
		|| (error.code ? `Request failed (${error.code}).` : 'Request failed.');
	return { ...result, error: { ...error, message } };
}

async function ensureRootSeries({ $i, heichelId, aliasId }) {
	const base = `${sp}/heichelos/${heichelId}/series/root`;
	const existing = await $i.db.get(`${base}/prateem`).catch(() => null);
	if (existing) return existing;
	const root = {
		id: 'root',
		name: 'Heichel Home',
		description: 'The primary publication stream of this Heichel.',
		author: aliasId,
		parentSeriesId: null,
		createdAt: Date.now(),
		isRoot: true,
		mode: 'collection'
	};
	await $i.db.write(`${base}/prateem`, root);
	await $i.db.write(`${base}/subSeries`, []);
	await $i.db.write(`${base}/posts`, {});
	return root;
}

async function initializeGovernance({ $i, heichelId, aliasId, policy }) {
	const base = `${sp}/heichelos/${heichelId}`;
	await $i.db.write(`${base}/members/${aliasId}`, {
		aliasId,
		role: 'owner',
		status: 'active',
		joinedAt: Date.now()
	});
	if (policy) {
		await $i.db.write(`${base}/settings/submissions`, {
			allowPostSubmissions: policy.allowContentSubmissions !== false,
			requirePostApproval: policy.requireContentApproval !== false,
			allowReferenceSubmissions: policy.allowReferenceSubmissions !== false,
			requireReferenceApproval: policy.requireReferenceApproval !== false
		});
	}
}

async function createHeichelInline({ $i, aliasId }) {
	const result = await nativeHeichel.createHeichel({ $i, aliasId });
	if (result?.error) return withErrorMessage(result);
	const details = result?.success?.details || result?.success || {};
	const heichelId = details.heichelId || $i.$_POST?.heichelId || $i.$_POST?.inputId;
	if (!heichelId) {
		return { error: { code: 'HEICHEL_ID_MISSING', message: 'The native creator returned no Heichel ID.' } };
	}
	await ensureRootSeries({ $i, heichelId, aliasId });
	await initializeGovernance({
		$i,
		heichelId,
		aliasId,
		policy: $i.$_POST?.policy
	});
	return getDestination({ $i, heichelId, seriesId: 'root', aliasId });
}

async function createSeriesInline({ $i, heichelId, aliasId }) {
	const result = await nativeSeries.makeNewSeries({
		$i: inputWithBody($i, { aliasId }),
		heichelId
	});
	if (result?.error) return withErrorMessage(result);
	const details = result?.success || {};
	const seriesId = details.id || details.seriesId;
	if (!seriesId) {
		return { error: { code: 'SERIES_ID_MISSING', message: 'The native creator returned no series ID.' } };
	}
	if ($i.$_POST?.policy) {
		await writeSeriesPolicy({
			$i,
			heichelId,
			seriesId,
			policy: $i.$_POST.policy
		});
	}
	return getDestination({ $i, heichelId, seriesId, aliasId });
}

module.exports = {
	inputWithBody,
	withErrorMessage,
	ensureRootSeries,
	initializeGovernance,
	createHeichelInline,
	createSeriesInline
};
