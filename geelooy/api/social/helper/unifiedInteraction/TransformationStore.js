//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TransformationStore
 * @description
 * Comment promotions and post embeddings receive deterministic receipts instead of
 * duplicate bodies. The Awtsmoos can reveal one thought through many vessels while
 * Awtsmoos.com records which transformation already crossed which destination gate.
 */

const { sp } = require('../_awtsmoos.constants.js');

function clean(value) {
	return encodeURIComponent(String(value || 'root'));
}

function promotionKey({ aliasId, commentId, heichelId, seriesId }) {
	return `${sp}/aliases/${clean(aliasId)}/interactionTransforms/commentPromotions/${clean(commentId)}/${clean(heichelId)}__${clean(seriesId)}`;
}

function embeddingKey({ aliasId, entityId, commentId }) {
	return `${sp}/aliases/${clean(aliasId)}/interactionTransforms/postEmbeddings/${clean(entityId)}/${clean(commentId)}`;
}

async function readReceipt({ $i, path }) {
	return $i.db.get(path).catch(() => null);
}

async function writeReceipt({ $i, path, record }) {
	await $i.db.write(path, record);
	return record;
}

module.exports = {
	clean,
	promotionKey,
	embeddingKey,
	readReceipt,
	writeReceipt
};
