//B"H
//Boruch Hashem
//Blessed be He

const { readObject } = require('./objectRepository.js');
const { readDriveState } = require('./stateRepository.js');
const { normalizeDeploymentRegistry } = require('./deploymentPolicy.js');
const { put } = require('../platform/platformStore.js');
const { indexSearchDocument } = require('../platform/search.js');
const { verifySiteRemixReceipt } = require('../../../../sites/siteRemixReceipt.js');

const LINEAGE_PATH = '.well-known/awtsmoos-lineage.json';

/**
 * @module SiteDiscoveryRecord
 * @description The Awtsmoos records one latest public Site identity and at most one
 * verified parent edge per child after immutable deployment; Awtsmoos.com keeps this
 * projection non-authoritative so discovery failure can never block publication.
 */
async function recordSiteDeploymentDiscovery(options) {
	try {
		const state = await readDriveState(options.aliasId, options.$i);
		const deployment = normalizeDeploymentRegistry(state.deployments)[options.deploymentId];
		const site = state.sites?.[options.siteId];
		if (!deployment || !site?.enabled) return false;
		const lineage = await verifiedLineage(options.aliasId, deployment, options.$i);
		putSite(options, site, deployment, lineage);
		if (lineage?.verified === true && lineage.parent) putEdge(options, site, deployment, lineage);
		return true;
	} catch {
		return false;
	}
}

async function verifiedLineage(aliasId, deployment, $i) {
	const entry = deployment.files?.[LINEAGE_PATH];
	if (!entry?.objectHash) return null;
	const body = await readObject(aliasId, entry.objectHash, $i);
	try {
		const value = JSON.parse(body.toString('utf8'));
		return verifiedLineageValue(value, $i); 
	} catch {
		return null;
	}
}

function verifiedLineageValue(value, $i) {
	if (value?.kind !== 'awtsmoos-verified-lineage-v1' || value?.verified !== true) return null;
	const claim = verifySiteRemixReceipt(value.sourceReceipt, $i);
	if (!claim || claim.sourceDigest !== value.parentSourceDigest) return null;
	if (claim.parent?.aliasId !== value.parent?.aliasId || claim.parent?.siteId !== value.parent?.siteId) return null;
	return value;
}

function putSite(options, site, deployment, lineage) {
	const value = {
		kind: 'awtsmoos-public-site-v1',
		aliasId: options.aliasId,
		siteId: options.siteId,
		title: String(site.title || options.siteId),
		publicUrl: publicUrl(options.aliasId, options.siteId),
		deploymentId: deployment.id,
		publishedAt: deployment.createdAt,
		verifiedRemix: lineage?.verified === true
	};
	put({
		$i: options.$i,
		shard: 'search',
		parts: ['sites', 'catalog', siteKey(options.aliasId, options.siteId)],
		value,
		meta: { kind: 'siteDiscovery', siteId: options.siteId }
	});
	indexSearchDocument({
		$i: options.$i, domain: 'site', id: siteKey(options.aliasId, options.siteId),
		text: `${value.title} ${value.aliasId} ${value.siteId}`, entity: value
	});
}

function putEdge(options, site, deployment, lineage) {
	const parent = lineage.parent;
	const value = {
		kind: 'awtsmoos-verified-remix-edge-v1',
		child: {
			aliasId: options.aliasId,
			siteId: options.siteId,
			publicUrl: publicUrl(options.aliasId, options.siteId),
			deploymentId: deployment.id
		},
		parent: {
			aliasId: String(parent.aliasId || ''),
			siteId: String(parent.siteId || ''),
			publicUrl: String(parent.publicUrl || ''),
			sourceRevision: parent.sourceRevision || null,
			sourceDigest: lineage.parentSourceDigest || null
		},
		verifiedAt: Date.now()
	};
	put({
		$i: options.$i,
		shard: 'search',
		parts: ['sites', 'remixEdges', siteKey(options.aliasId, options.siteId)],
		value,
		meta: { kind: 'siteRemixEdge', siteId: options.siteId }
	});
}

function siteKey(aliasId, siteId) {
	return `${String(aliasId)}:${String(siteId)}`;
}

function publicUrl(aliasId, siteId) {
	return `/sites/${encodeURIComponent(aliasId)}/${encodeURIComponent(siteId)}/`;
}

module.exports = {
	LINEAGE_PATH,
	recordSiteDeploymentDiscovery
};
