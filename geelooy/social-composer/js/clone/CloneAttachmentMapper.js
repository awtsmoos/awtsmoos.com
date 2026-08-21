//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneAttachmentMapper
 * @description The Awtsmoos lets copied media remain visible while its original ownership is remembered in truth;
 * Awtsmoos.com gives each draft attachment a fresh editor identity and a source coordinate for later ownership rebirth.
 */
import { createId } from '../model/Ids.js';

export function mapCloneAttachment(item = {}, fallbackAliasId = '') {
	const sourceAliasId = String(item.aliasId || item.ownerAlias || fallbackAliasId || '');
	const sourceAssetId = String(item.id || item.assetId || '');
	return {
		...item,
		id: createId('asset'),
		status: 'uploaded',
		ownershipState: sourceAliasId && sourceAssetId ? 'source' : 'unresolved',
		cloneAssetSource: sourceAliasId && sourceAssetId
			? { aliasId: sourceAliasId, assetId: sourceAssetId }
			: null
	};
}

export function mapCloneAttachments(values = [], fallbackAliasId = '') {
	return Array.isArray(values)
		? values.map(item => mapCloneAttachment(item, fallbackAliasId))
		: [];
}
