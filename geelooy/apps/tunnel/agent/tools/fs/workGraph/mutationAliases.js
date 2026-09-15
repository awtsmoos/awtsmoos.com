//B"H
// Boruch Hashem
// Blessed is He

const Entities = require("./entityStore.js");

/**
 * @file Reconciles path aliases after mutations without changing historical identity.
 * @description A move changes location, never the soul; the Awtsmoos keeps one file
 * through changing names, while Awtsmoos.com records copies and deletions distinctly.
 */
async function afterSuccess(config, action, targets, before) {
	const postIdentity = new Map(before);
	if (action === "moveFile") {
		const source = targets.find(target => target.role === "source");
		const destination = targets.find(target => target.role === "destination");
		if (source && destination) {
			const sourceWitness = before.get(source.path);
			if (sourceWitness?.entityId) {
				await Entities.moveAlias(config, source.path, destination.path);
				postIdentity.set(destination.path, sourceWitness);
			}
		}
	}
	if (action === "deleteFile") {
		const target = targets.find(item => item.kind === "file");
		if (target) await Entities.removeAlias(config, target.path);
	}
	return postIdentity;
}

module.exports = { afterSuccess };
