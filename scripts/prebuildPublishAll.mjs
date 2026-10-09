// B"H
// Prebuild staged publishAll payloads into pre-serialized AwtsmoosDB records.
//
// Takes a staging directory containing:
//   manifest.json  — {files:[{file, postId, series, alias}], ...}
//   *.json         — payload files with {commentArray:[...]}
//
// Produces a tarball ready for POST /packed/import/bulk/stage containing:
//   manifest.json  — same entries but {file:"<name>.bin", prebuilt:true, sha256, bytes, commentCount}
//   *.bin          — awts.serializeJSON(postData) bytes, written verbatim by the server
//
// The server's instant path (freshImport:true + prebuilt manifest) then does
// zero parsing, zero ID derivation, zero serialization — raw bytes to the store.
//
// Usage:
//   node scripts/prebuildPublishAll.mjs --in <stagingDir> --out <tarballPath> [--heichelId ikar]
//
// The comment-ID derivation MUST match the server's buildComment exactly
// (bulkPublishAllRoutes.js); both use SHA-256 over postId/verseSection/
// subsectionId/content, so prebuilt files are byte-identical to what the
// server would have built. Re-running the import is idempotent.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const awts = require(path.join(REPO, 'ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js'));

function serializeJSON(obj) {
	return awts.serializeJSON(obj);
}

function deterministicCommentId(item, ctx) {
	const h = crypto.createHash('sha256');
	h.update(String(ctx.postId) + '\n');
	h.update(String(item.dayuh.verseSection) + '\n');
	h.update(String(item.dayuh.subsectionId) + '\n');
	h.update(String(item.content));
	const hex = h.digest('hex');
	const tsPart = String(BigInt('0x' + hex.slice(0, 12)) % 9000000000000n + 1000000000000n);
	return 'BH_' + tsPart + '_' + hex.slice(12, 28) + '_commentBy_' + ctx.aliasId;
}

function commentIdFor(item, ctx) {
	if (item.id && typeof item.id === 'string' && item.id.length > 0) return item.id;
	if (item.commentId && typeof item.commentId === 'string' && item.commentId.length > 0) return item.commentId;
	return deterministicCommentId(item, ctx);
}

function buildComment(item, ctx, now) {
	const commentId = String(commentIdFor(item, ctx));
	const verseSection = String(item.dayuh.verseSection);
	const subsectionId = String(item.dayuh.subsectionId);
	return {
		id: commentId, heichelId: ctx.heichelId, postId: ctx.postId, entityId: ctx.postId,
		seriesId: ctx.seriesId,
		parentId: '', parentSectionId: '', parentType: 'entity',
		aliasId: ctx.aliasId, author: ctx.aliasId, content: item.content,
		verseSection, subsectionId,
		dayuh: { ...item.dayuh, kind: 'translation' },
		importedFrom: 'bulk-import-api-publishAll', importedAt: now, createdAt: now, updatedAt: now, deleted: false,
	};
}

function parseArgs(argv) {
	const out = {};
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === '--in') out.in = argv[++i];
		else if (argv[i] === '--out') out.out = argv[++i];
		else if (argv[i] === '--heichelId') out.heichelId = argv[++i];
	}
	return out;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (!args.in || !args.out) {
		console.error('Usage: node scripts/prebuildPublishAll.mjs --in <stagingDir> --out <tarballPath> [--heichelId ikar]');
		process.exit(2);
	}
	const inDir = path.resolve(args.in);
	const heichelId = args.heichelId || 'ikar';
	const manifestPath = path.join(inDir, 'manifest.json');
	if (!fs.existsSync(manifestPath)) throw new Error('No manifest.json in ' + inDir);
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	const files = Array.isArray(manifest.files) ? manifest.files : [];
	if (!files.length) throw new Error('MANIFEST_EMPTY');

	const tmpDir = fs.mkdtempSync(path.join('/tmp', 'prebuild-'));
	const now = Date.now();
	const outFiles = [];
	let totalComments = 0;

	for (const f of files) {
		if (!f.file || !f.postId || !f.alias) throw new Error('MANIFEST_ENTRY_INVALID: ' + JSON.stringify(f));
		const payloadPath = path.join(inDir, f.file);
		const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
		const items = Array.isArray(payload.commentArray) ? payload.commentArray : [];
		if (!items.length) throw new Error('EMPTY_PAYLOAD: ' + f.file);
		const ctx = { heichelId, seriesId: f.series, postId: f.postId, aliasId: f.alias };
		const comments = items.map(item => buildComment(item, ctx, now));
		const postData = {
			postId: f.postId, seriesId: f.series, aliasId: f.alias, heichelId,
			commentCount: comments.length, comments,
		};
		const bin = serializeJSON(postData);
		if (!Buffer.isBuffer(bin)) throw new Error('serializeJSON did not return a Buffer');
		const binName = f.file.replace(/\.json$/, '') + '.bin';
		fs.writeFileSync(path.join(tmpDir, binName), bin);
		const sha256 = crypto.createHash('sha256').update(bin).digest('hex');
		outFiles.push({
			file: binName, postId: f.postId, series: f.series, alias: f.alias,
			sha256, bytes: bin.length, commentCount: comments.length,
		});
		totalComments += comments.length;
	}

	const outManifest = {
		prebuilt: true,
		prebuiltBy: 'scripts/prebuildPublishAll.mjs',
		prebuiltAt: new Date().toISOString(),
		heichelId,
		files: outFiles,
		postCount: outFiles.length,
		totalComments,
	};
	fs.writeFileSync(path.join(tmpDir, 'manifest.json'), JSON.stringify(outManifest));

	// Build the tarball (gzip) the /stage endpoint expects.
	const outPath = path.resolve(args.out);
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	execFileSync('tar', ['-czf', outPath, '-C', tmpDir, '.']);

	console.log(JSON.stringify({
		ok: true,
		tarball: outPath,
		tarballBytes: fs.statSync(outPath).size,
		postCount: outFiles.length,
		totalComments,
		prebuilt: true,
	}, null, 2));

	fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(e => { console.error('PREBUILD_FAILED: ' + e.message); process.exit(1); });
