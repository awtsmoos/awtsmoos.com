//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneDraftMapper
 * @description The Awtsmoos lets authored form pass into a new vessel while social history and identity stay behind;
 * Awtsmoos.com maps editable text, media lineage, sections, and question law while source authorship survives only in provenance design.
 */
import { createBlock, createId } from '../model/Ids.js';
import { mapCloneAttachments } from './CloneAttachmentMapper.js';

function blocks(documentValue, fallback = '') {
	const values = Array.isArray(documentValue?.blocks) ? documentValue.blocks : [];
	if (values.length) {
		return values.map(item => ({
			id: createId('block'),
			type: String(item.type || 'paragraph'),
			text: String(item.text || ''),
			segments: []
		}));
	}
	const block = createBlock();
	block.text = String(fallback || '');
	return [block];
}

function subsection(item = {}, sourceAliasId = '') {
	return {
		id: createId('subsection'),
		title: String(item.label || item.title || 'Subsection'),
		blocks: blocks(item.options?.richDocument, item.content),
		attachments: mapCloneAttachments(item.assets, sourceAliasId),
		commentsEnabled: item.options?.commentsEnabled !== false
	};
}

function section(item = {}, sourceAliasId = '') {
	return {
		id: createId('verse'),
		title: String(item.title || 'Verse'),
		blocks: blocks(item.options?.richDocument, item.content),
		attachments: mapCloneAttachments(item.assets, sourceAliasId),
		subsections: (item.segments || []).map(value => subsection(value, sourceAliasId)),
		commentsEnabled: item.options?.commentsEnabled !== false
	};
}

export function mapCloneRecord(record = {}, source = {}) {
	const sourceKind = String(record.contentType || record.entityType || source.type || 'post');
	const sourceAliasId = String(record.aliasId || source.aliasId || '');
	const postKind = sourceKind === 'question' ? 'question' : 'post';
	return {
		postKind,
		presentationKind: postKind,
		questionId: '',
		title: String(record.title || ''),
		summary: String(record.options?.summary || record.summary || ''),
		rootBlocks: blocks(record.options?.rootDocument, record.content),
		rootAttachments: mapCloneAttachments(record.rootAssets, sourceAliasId),
		sections: Array.isArray(record.sections)
			? record.sections.map(value => section(value, sourceAliasId))
			: [],
		creatorMetadata: {},
		questionOptions: postKind === 'question' ? record.options?.question || undefined : undefined,
		canonicalSource: null,
		cloneSource: {
			type: sourceKind,
			id: String(record.id || record.postId || source.id || ''),
			heichelId: String(record.heichelId || source.heichelId || ''),
			seriesId: String(record.seriesId || source.seriesId || 'root'),
			aliasId: sourceAliasId
		}
	};
}
