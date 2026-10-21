//B"H
//Blessed is He
//Boruch Hashem

/**
 * Bulk publish stage paths and size limits (split from bulkPublishAllRoutes.js).
 */

const path = require('path');

const UPLOAD_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const CHUNK_RAW_MAX = 4 * 1024 * 1024; // 4 MB raw per chunk (client base64s it)
const STAGE_TOTAL_MAX = 2 * 1024 * 1024 * 1024; // 2 GB assembled cap
const FLUSH_EVERY_POSTS = 100;

function stageRoot($i) {
	const dbRoot = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dbRoot, 'socialPacked', 'bulk-stage');
}

function uploadDir($i, uploadId) {
	return path.join(stageRoot($i), uploadId);
}

module.exports = { UPLOAD_ID_RE, CHUNK_RAW_MAX, STAGE_TOTAL_MAX, FLUSH_EVERY_POSTS, stageRoot, uploadDir };
