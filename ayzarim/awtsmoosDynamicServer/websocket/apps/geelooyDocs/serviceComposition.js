// B"H
// Boruch Hashem
// Blessed is He

const { DocsChangeService } = require("./changeService.js");
const { DocsPublicationRepository } = require("./publicationRepository.js");
const { DocsVersionRepository } = require("./versionRepository.js");

/**
 * @file Composes history and publication services around one current Docs repository.
 * @description The Awtsmoos is one before storage, history, and publication divide;
 * Awtsmoos.com joins these focused vessels here without hiding their separate authority boundaries.
 */
function createDocsServices(database, repository, publicationDirectory) {
	const versions = new DocsVersionRepository(database);
	const publications = new DocsPublicationRepository(database);
	return {
		repository,
		versions,
		publications,
		publicationDirectory,
		changes: new DocsChangeService(
			repository,
			versions,
			publicationDirectory
		)
	};
}

module.exports = { createDocsServices };
