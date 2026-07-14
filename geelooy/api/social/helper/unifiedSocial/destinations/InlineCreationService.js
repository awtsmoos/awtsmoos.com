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
	if (result?.error) return result;
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
	if (result?.error) return result;
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
	ensureRootSeries,
	initializeGovernance,
	createHeichelInline,
	createSeriesInline
};
