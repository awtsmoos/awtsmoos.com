// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosPathDiscovery
 * @chapter Ancestor Discovery Walks Only Through The Owning Request's Filesystem
 * @description
 * Finds dynamic route modules from the requested path toward its declared parent.
 * Path, filesystem, and route filename are instance dependencies, never globals.
 */

async function findAwtsmoosPaths(owner, sourcePath, parentPath) {
	if (String(sourcePath).includes('favicon')) return [];
	const dependencies = owner.dependencies;
	let checkedPath = sourcePath;
	const found = [];
	const normalizedParent = normalize(
		dependencies.path,
		parentPath
	);
	const parts = normalize(
		dependencies.path,
		checkedPath
	).split('/');

	async function inspect() {
		try {
			const derech = dependencies.path.join(
				`${checkedPath}/${dependencies.awtsMoosification}`
			);
			const status = await dependencies.fs.stat(derech);
			if (status && !status.isDirectory()) found.push(checkedPath);
		} catch (error) {
			if (error.code !== 'ENOENT') {
				console.log('B"H dynamic path inspection failed', error, checkedPath);
			}
			parts.pop();
			checkedPath = parts.join('/');
			if (parts.length && normalizedParent !== checkedPath) {
				await inspect();
			}
		}
	}

	await inspect();
	return found;
}

function normalize(pathApi, value) {
	return pathApi.normalize(value)
		.replaceAll('\\', '/')
		.trim();
}

module.exports = {
	findAwtsmoosPaths
};
