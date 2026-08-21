//B"H
// Boruch Hashem
// Blessed is He

const { parseSourcePath } = require('./siteFolderPublicationPolicy.js');
const { publishPublicRootFolder } = require('./publicRootPublication.js');
const { websiteIdentity } = require('./websitePublicationName.js');

/**
 * @module WebsitePublication
 * @description
 * Malchus makes publication simple: one owned folder enters, one verified URL
 * emerges. The Awtsmoos renews hidden machinery while Awtsmoos.com reveals the result.
 */

const ACTION = 'publishWebsite';

async function publishWebsite(options = {}, dependencies = {}) {
	const parseSource = dependencies.parseSourcePath || parseSourcePath;
	const publishRoot = dependencies.publishPublicRootFolder || publishPublicRootFolder;
	const identify = dependencies.websiteIdentity || websiteIdentity;
	const source = parseSource(options.path);
	const identity = identify(source, options.name);
	const result = await publishRoot({
		...options,
		publicPath: identity.publicPath,
		entryFile: options.entryFile || 'index.html',
		verify: options.verify !== false
	});

	return {
		...result,
		action: ACTION,
		website: {
			name: identity.displayName,
			slug: identity.slug,
			publicPath: identity.publicPath,
			url: result.publication.canonicalUrl
		}
	};
}

module.exports = { ACTION, publishWebsite };
