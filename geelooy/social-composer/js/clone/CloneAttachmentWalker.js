//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneAttachmentWalker
 * @description The Awtsmoos is one through root, verse, and subsection while each vessel keeps its place;
 * Awtsmoos.com walks copied attachments uniformly so current alias ownership can change without missing a hidden media face.
 */

export function cloneAttachmentArrays(value = {}) {
	const arrays = [value.rootAttachments || []];
	for (const section of value.sections || []) {
		arrays.push(section.attachments || []);
		for (const subsection of section.subsections || []) {
			arrays.push(subsection.attachments || []);
		}
	}
	return arrays;
}

export function allCloneAttachments(value = {}) {
	return cloneAttachmentArrays(value).flat();
}

export function cloneAssetKey(item = {}) {
	const source = item.cloneAssetSource;
	return source?.aliasId && source?.assetId
		? `${source.aliasId}:${source.assetId}`
		: '';
}

export function unresolvedCloneAttachments(value = {}) {
	return allCloneAttachments(value)
		.filter(item => item.ownershipState === 'unresolved');
}

export function attachmentOwnedByAlias(item = {}, aliasId = '') {
	if (!item.cloneAssetSource) return true;
	if (item.cloneAssetSource.aliasId === aliasId) return true;
	return item.ownedByAlias === aliasId;
}

export function borrowedCloneAttachments(value = {}, aliasId = '') {
	return allCloneAttachments(value).filter(item => {
		if (!item.cloneAssetSource?.assetId || !item.cloneAssetSource?.aliasId) return false;
		return !attachmentOwnedByAlias(item, aliasId);
	});
}

export function applyOwnedManifest(value, key, aliasId, manifest) {
	for (const attachments of cloneAttachmentArrays(value)) {
		for (const item of attachments) {
			if (cloneAssetKey(item) !== key) continue;
			Object.assign(item, {
				manifest,
				publicPath: manifest.publicPath,
				type: manifest.type,
				mime: manifest.mime,
				size: manifest.size,
				status: 'uploaded',
				ownershipState: 'owned',
				ownedByAlias: aliasId
			});
		}
	}
}
