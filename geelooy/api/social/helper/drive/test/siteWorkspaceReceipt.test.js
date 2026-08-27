//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos distinguishes the drafting vessel from the canonical Drive vessel;
 * Awtsmoos.com returns useful paths while refusing to call an unproven URL or deep
 * link live merely because a project and route have names.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSiteWorkspaceReceipt } = require('../siteWorkspaceReceipt.js');

function readySite() {
	return {
		id: 'website-starter',
		rootPath: 'sites/website-starter',
		readiness: { ready: true, status: 'ready' },
		project: {
			publication: {
				state: 'ready',
				route: '/sites/asdf/website-starter/'
			},
			domains: { status: 'unattached', attachedCount: 0, domains: [] }
		}
	};
}

function sourcePublication() {
	return {
		vessel: 'awtsmoos-drive',
		rootPath: 'sites/website-starter',
		fileCount: 2,
		totalBytes: 24,
		files: []
	};
}

test('receipt separates hosted workspace from canonical Drive publication', () => {
	const receipt = buildSiteWorkspaceReceipt({
		aliasId: 'asdf',
		project: { id: 'website-starter', rootPath: 'sites/website-starter' },
		site: readySite(),
		testimony: { version: 3 },
		sourcePublication: sourcePublication()
	});
	assert.equal(receipt.version, 2);
	assert.equal(receipt.workspacePath, 'asdf/sites/website-starter');
	assert.equal(receipt.source.workspaceVessel, 'awtsmoos-virtual-os');
	assert.equal(receipt.source.canonicalVessel, 'awtsmoos-drive');
	assert.equal(receipt.source.nativeTunnelRequiredForWorkspace, false);
	assert.equal(receipt.source.publication.fileCount, 2);
	assert.equal(receipt.links.canonicalUrl, 'https://awtsmoos.com/sites/asdf/website-starter/');
	assert.equal(receipt.links.canonicalVerifiedLive, false);
	assert.equal(receipt.links.workspaceDeepLinkVerified, false);
	assert.equal(receipt.warnings.includes('CANONICAL_SOURCE_NOT_PUBLISHED'), false);
	assert.ok(receipt.warnings.includes('CANONICAL_URL_NOT_EXTERNALLY_VERIFIED'));
});

test('native tunnel workspace truthfully declares device dependence', () => {
	const receipt = buildSiteWorkspaceReceipt({
		aliasId: 'asdf',
		project: { id: 'local', rootPath: 'sites/local' },
		site: readySite(),
		sourceVessel: 'native-tunnel',
		sourcePublication: sourcePublication()
	});
	assert.equal(receipt.source.nativeTunnelRequiredForWorkspace, true);
});
