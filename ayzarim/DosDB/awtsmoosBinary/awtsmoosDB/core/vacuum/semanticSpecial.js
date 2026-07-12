// B"H

/**
 * @file core/vacuum/semanticSpecial.js
 * @chapter Hidden Bodies Are Weighed By Content, Never By Address
 * @description
 * Hashes ABLB, ATXT, and FS3 manifests by logical identity and body bytes while
 * excluding physical offsets.
 */

function visitBlob(token, context, visit) {
	context.writer.tag('blob');
	visit(token.id, context);
	visit(token.meta || {}, context);
	context.writer.number(token.length);
	let offset = 0;
	while (offset < token.length) {
		const length = Math.min(1024 * 1024, token.length - offset);
		context.writer.bytes(context.db.blob.read(token, offset, length));
		offset += length;
	}
}

function visitText(token, context, visit) {
	context.writer.tag('text');
	visit(token.id, context);
	visit(token.chunkChars, context);
	visit(token.chars, context);
	visit(token.bytes, context);
	for (const block of token.blocks) {
		visit(block.chars, context);
		visit(block.bytes, context);
		visitBlob(block.blob, context, visit);
	}
}

function visitVirtualFs(token, context, visit) {
	const blob = token.blob && token.blob.__resolve__ ? token.blob.__resolve__() : token.blob;
	if (!blob || blob.__awtsmoosBlob !== true) throw new Error('B"H invalid FS3 manifest token');
	const bytes = context.db.blob.read(blob, 0, Number(token.bytes || blob.length));
	const manifest = JSON.parse(bytes.toString('utf8'));
	context.writer.tag('virtual-fs-manifest');
	visit(token.version, context);
	visit(blob.id, context);
	visit(blob.meta || {}, context);
	visit(manifest, context);
}

module.exports = {
	visitBlob,
	visitText,
	visitVirtualFs
};
