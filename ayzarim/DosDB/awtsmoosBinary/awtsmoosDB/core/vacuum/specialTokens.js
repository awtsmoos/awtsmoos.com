// B"H

/**
 * @file core/vacuum/specialTokens.js
 * @chapter The Body Crosses The River While Its Name Remains
 * @description
 * Relocates ABLB and ATXT bodies into the destination while preserving their
 * logical identifiers and metadata. Copying is chunked so large bodies remain
 * bounded in memory.
 */

const COPY_CHUNK = 1024 * 1024;

function cloneBlob(token, context, cloneValue) {
	const metadata = cloneValue(token.meta || {}, context);
	const body = context.destination.blob.create(token.length, metadata);
	let offset = 0;
	while (offset < token.length) {
		const length = Math.min(COPY_CHUNK, token.length - offset);
		const chunk = context.source.blob.read(token, offset, length);
		context.destination.pager.writeExact(body.offset + offset, chunk);
		offset += length;
	}
	context.stats.blobs++;
	context.stats.blobBytes += token.length;
	return { ...body, id: token.id, meta: metadata };
}

function cloneText(token, context, cloneValue) {
	const blocks = token.blocks.map(block => ({
		chars: block.chars,
		bytes: block.bytes,
		blob: cloneBlob(block.blob, context, cloneValue)
	}));
	context.stats.texts++;
	return {
		__awtsmoosText: true,
		id: token.id,
		chunkChars: token.chunkChars,
		chars: token.chars,
		bytes: token.bytes,
		blocks
	};
}

module.exports = {
	cloneBlob,
	cloneText
};
