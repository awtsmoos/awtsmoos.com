//B"H
// Boruch Hashem
// Blessed is He

const { aliasOwned } = require('../api/tunnel/control/routes/osFs/aliases.js');
const { assertSourceOwned } = require('./siteFolderPublicationPolicy.js');
const { parsePublicRootPublicationInput } = require('./publicRootPublicationInput.js');
const { buildPublicRootRelease } = require('./publicRootReleaseManifest.js');
const { beginPublicRootDeployment } = require('./publicRootPublicationTransport.js');
const { verifyPublicRootRelease } = require('./publicRootPublicationVerify.js');

/**
 * @module PublicRootPublication
 * @description
 * The Awtsmoos joins owned source, exact hashes, atomic promotion, and public
 * observation without collapsing their boundaries. Awtsmoos.com calls the URL
 * canonical only after the intended static release has answered through HTTPS.
 */

const ACTION = 'publicRootPublishFolder';
const DEFAULT_DEPENDENCIES = Object.freeze({
	aliasOwned,
	beginPublicRootDeployment,
	buildPublicRootRelease,
	parsePublicRootPublicationInput,
	verifyPublicRootRelease
});

async function publishPublicRootFolder(options = {}, dependencies = DEFAULT_DEPENDENCIES) {
	const input = dependencies.parsePublicRootPublicationInput(options);
	await assertSourceOwned(
		{ aliasOwned: dependencies.aliasOwned },
		options.$i,
		options.actorUserId,
		input.source.aliasId
	);

	const manifest = await dependencies.buildPublicRootRelease({
		$i: options.$i,
		aliasId: input.source.aliasId,
		sourceRoot: input.source.innerPath,
		entryFile: input.entryFile
	});
	const deployment = await dependencies.beginPublicRootDeployment({
		manifest,
		publicPath: input.publicPath,
		publicRoot: options.publicRoot
	});

	let verification = { verified: false, skipped: true };
	try {
		if (input.verify) {
			verification = await dependencies.verifyPublicRootRelease({
				publicUrl: input.publicUrl,
				entryFile: input.entryFile,
				manifest
			});
		}
	} catch (error) {
		await deployment.rollback();
		throw error;
	}

	const cleanup = await deployment.finalize();
	return publicationReceipt(input, manifest, verification, cleanup);
}

function publicationReceipt(input, manifest, verification, cleanup) {
	return {
		ok: true,
		action: ACTION,
		plane: 'public-root-static',
		source: {
			aliasId: input.source.aliasId,
			path: input.source.innerPath
		},
		release: {
			fileCount: manifest.fileCount,
			bytes: manifest.bytes,
			sha256: manifest.releaseSha256
		},
		deployment: {
			publicPath: input.publicPath,
			productionTarget: `geelooy/${input.publicPath}`,
			backupRemoved: cleanup.backupRemoved
		},
		publication: {
			canonicalUrl: input.publicUrl,
			canonicalVerifiedLive: verification.verified === true
		},
		verification
	};
}

module.exports = { ACTION, DEFAULT_DEPENDENCIES, publishPublicRootFolder, publicationReceipt };
