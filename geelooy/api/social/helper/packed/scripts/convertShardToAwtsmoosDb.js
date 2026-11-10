#!/usr/bin/env node
//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file convertShardToAwtsmoosDb.js
 * @description
 * Chapter 110: The journal is read once, by its own index, and its living
 * records are settled into the AwtsmoosDB vessel — nothing is folded in
 * memory, nothing is left behind, and the tombstones travel too.
 *
 * Converts ONE packed shard from its JSONL append-log
 * (dayuhChadash/socialPacked/social.<shard>.awtsdb + .keyidx.json sidecar)
 * into the social-shards AwtsmoosDB vessel, through the repo's own
 * shardStore (geelooy/api/social/helper/awtsmoosDb/shardStore.js).
 *
 * Method (json-migration assessment, step 1):
 *   1. keyIndexCurrent.ensureCurrent() runs the sidecar tail-scan
 *      catch-up first — batched mirror appends never call noteWrite,
 *      so the sidecar lags the file until this scan.
 *   2. Live records are enumerated from the index (key -> latest byte
 *      offset), in first-seen order. Superseded lines are never read.
 *   3. Each live line is read by offset from one open fd and written
 *      verbatim with store.put({ shard, parts: ['records', key],
 *      value: envelope }) — the exact call writePacked's AwtsmoosDB
 *      branch makes — INCLUDING op:'del' tombstone envelopes, so the
 *      vessel sees identical semantics to a DB-native write history.
 *   Memory is O(chunk): the whole shard is never loaded or folded.
 *
 * The run is idempotent and resumable: puts overwrite by key with the
 * same envelope, and a checkpoint report records the last completed
 * key so --resume can continue a stopped bulk pass.
 *
 * Usage:
 *   AWTSMOOS_SOCIAL_AWTSDB=/mnt/.../dayuhChadash/socialPacked/social-shards.awtsmoosdb \
 *     node geelooy/api/social/helper/packed/scripts/convertShardToAwtsmoosDb.js \
 *       --shard=core --db=/mnt/.../dayuhChadash --expected=157191
 *
 *   # stop-window delta pass: only records appended at/after the
 *   # high-water offset printed by the bulk pass
 *     node .../convertShardToAwtsmoosDb.js --shard=core --db=... \
 *       --topup --since-offset=15658923843 --expect-identity=64770:123456789
 *
 *   # read-only rehearsal: enumerate + read + verify lines, write nothing
 *     node .../convertShardToAwtsmoosDb.js --shard=meta --db=... --dry
 *
 * Options:
 *   --shard=<name>        (required) core | allPosts | meta | graph |
 *                         notify | audit | search | feed
 *   --db=<path>           dayuhChadash root holding socialPacked/
 *                         (default: ../../dayuhChadash from cwd)
 *   --file=<path>         explicit JSONL shard file (overrides --db)
 *   --vessel=<path>       social-shards vessel path; sets
 *                         AWTSMOOS_SOCIAL_AWTSDB before shardStore is
 *                         required (shardRoot resolves it at load).
 *                         Required unless the env var is already set —
 *                         the converter refuses to guess a vessel
 *                         location (the default would land on the
 *                         root filesystem, not the data volume).
 *   --expected=<n>        expected logical key count for final
 *                         verification (default: the enumerated count)
 *   --batch=<n>           records per put chunk (default 500)
 *   --progress=<n>        log every n processed records (default 1000)
 *   --spot=<n>            spot-hash sample size (default 128)
 *   --topup               only write records whose latest JSONL offset
 *                         is >= --since-offset
 *   --since-offset=<n>    high-water offset from the bulk pass
 *   --expect-identity=<dev:ino>  abort in --topup if the JSONL file
 *                         was replaced since the bulk pass
 *   --resume              continue a bulk pass from the checkpoint
 *                         report's lastKey (not with --topup)
 *   --report=<path>       checkpoint/report JSON path
 *                         (default .awtsmoos-tmp/convert-<shard>-report.json)
 *   --dry                 enumerate and read only; no vessel writes
 *
 * Exit codes: 0 = PASS, 1 = FAIL (read errors or verification
 * mismatch), 2 = usage / configuration error.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function arg(name, fallback = '') {
	const found = process.argv.find(item => item === `--${name}` || item.startsWith(`--${name}=`));
	if (!found) return fallback;
	return found.includes('=') ? found.split('=').slice(1).join('=') : 'yes';
}

function intArg(name, fallback) {
	const raw = arg(name, '');
	if (raw === '' || raw === 'yes') return fallback;
	const n = Number(raw);
	return Number.isFinite(n) ? n : fallback;
}

function usageError(message) {
	console.error(`B"H convertShardToAwtsmoosDb: ${message}`);
	process.exit(2);
}

// The vessel path is resolved by awtsmoosDb/shardRoot.js at the moment
// shardStore is required, so the env must be settled before any repo
// module is loaded.
const dryRun = Boolean(arg('dry', ''));
if (arg('vessel', '')) {
	process.env.AWTSMOOS_SOCIAL_AWTSDB = path.resolve(arg('vessel', ''));
}
if (!dryRun && !process.env.AWTSMOOS_SOCIAL_AWTSDB) {
	usageError('no vessel location: pass --vessel=<path> or set AWTSMOOS_SOCIAL_AWTSDB. ' +
		'Refusing to let shardRoot default the vessel onto the root filesystem.');
}

// Repo modules (paths relative to geelooy/api/social/helper/packed/scripts/).
const { SHARDS, shardFile } = require('../shardPaths.js');
const { ensureCurrent } = require('../keyIndexCurrent.js');
const { readLineAt } = require('../keyIndexRead.js');
const store = require('../../awtsmoosDb/shardStore.js');

/** Mirrors keyIndexStore.fileIdentity / migrateIkarPostsHelpers.acquireRunLock. */
function fileIdentity(file) {
	try {
		const st = fs.statSync(file);
		return `${st.dev}:${st.ino}`;
	} catch {
		return '';
	}
}

function acquireRunLock(file) {
	try {
		const fd = fs.openSync(file, 'wx');
		fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, startedAt: Date.now() }, null, 2));
		return () => { try { fs.closeSync(fd); } catch {} try { fs.rmSync(file, { force: true }); } catch {} };
	} catch (error) {
		throw new Error(`Conversion already running or stale lock exists: ${file}`);
	}
}

async function writeJson(file, value) {
	await fs.promises.mkdir(path.dirname(file), { recursive: true });
	const tmp = `${file}.tmp-${process.pid}`;
	await fs.promises.writeFile(tmp, JSON.stringify(value, null, 2));
	await fs.promises.rename(tmp, file);
}

/**
 * Reads and parses the single line starting at offset, from an already
 * open fd. Mirrors keyIndexRead.readLineAt's contract (line = bytes up
 * to the first '\n'; null for blank/unparseable input) with two
 * deliberate differences, both in the direction of not losing data:
 * the read window grows past readLineAt's 4 MB cap until the newline
 * or EOF, and the fd is reused instead of opened per record.
 */
async function readLineAtFd(fh, offset, fileSize) {
	const CHUNK = 1024 * 1024;
	const parts = [];
	let pos = offset;
	let total = 0;
	let terminated = false;
	while (pos < fileSize) {
		const n = Math.min(CHUNK, fileSize - pos);
		if (n <= 0) break;
		const buf = Buffer.allocUnsafe(n);
		const { bytesRead } = await fh.read(buf, 0, n, pos);
		if (bytesRead <= 0) break;
		const slice = buf.subarray(0, bytesRead);
		const nl = slice.indexOf(0x0A);
		if (nl >= 0) {
			parts.push(slice.subarray(0, nl));
			total += nl;
			terminated = true;
			break;
		}
		parts.push(slice);
		total += bytesRead;
		pos += bytesRead;
	}
	if (!parts.length) return null;
	const text = Buffer.concat(parts, total).toString('utf8');
	if (!text.trim()) return null;
	return { record: JSON.parse(text), bytes: total + (terminated ? 1 : 0) };
}

function stableStringify(value) {
	if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
	if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
	const keys = Object.keys(value).sort();
	return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

function hashOf(value) {
	return crypto.createHash('sha256').update(stableStringify(value)).digest('hex');
}

async function main() {
	const shard = arg('shard', '');
	if (!shard || !SHARDS[shard]) {
		usageError(`--shard must be one of: ${Object.keys(SHARDS).join(', ')}`);
	}
	const topup = Boolean(arg('topup', ''));
	const resume = Boolean(arg('resume', ''));
	if (topup && resume) usageError('--resume cannot be combined with --topup');
	const sinceOffset = intArg('since-offset', -1);
	if (topup && sinceOffset < 0) usageError('--topup requires --since-offset=<bulk-pass high-water offset>');
	const expectIdentity = arg('expect-identity', '');
	const expectedArg = intArg('expected', -1);
	const batchSize = Math.max(1, intArg('batch', 500));
	const progressEvery = Math.max(1, intArg('progress', 1000));
	const spotCount = Math.max(0, intArg('spot', 128));

	const dbRoot = path.resolve(process.cwd(), arg('db', '../../dayuhChadash'));
	const file = arg('file', '') ? path.resolve(arg('file', '')) : shardFile(dbRoot, shard);
	if (!fs.existsSync(file)) usageError(`shard file not found: ${file}`);
	const reportPath = path.resolve(process.cwd(), arg('report', `.awtsmoos-tmp/convert-${shard}-report.json`));

	const releaseLock = acquireRunLock(`${file}.convert.lock`);
	const startedAt = Date.now();
	const report = {
		B_H: true,
		script: 'convertShardToAwtsmoosDb',
		shard,
		file,
		vessel: dryRun ? (process.env.AWTSMOOS_SOCIAL_AWTSDB || '(not opened — dry)') : store.info().path,
		mode: dryRun ? 'dry' : topup ? 'topup' : 'bulk',
		startedAt,
		pid: process.pid
	};
	try {
		// Step 1: sidecar tail-scan catch-up, then enumerate live
		// records by latest offset (first-seen order).
		const entry = await ensureCurrent(file);
		const identity = fileIdentity(file);
		const highWater = entry.index.size;
		if (topup && expectIdentity && expectIdentity !== identity) {
			throw new Error(`file identity changed since the bulk pass (expected ${expectIdentity}, found ${identity}); ` +
				'the JSONL was replaced — offsets are meaningless, run a full bulk pass instead');
		}
		const allEntries = Object.entries(entry.index.keys).map(([key, offset]) => ({ key, offset }));
		const fullTotal = allEntries.length;
		let entries = allEntries;
		if (topup) entries = entries.filter(e => e.offset >= sinceOffset);

		// Step 2 (optional): resume a bulk pass after its last
		// checkpointed key, in the same enumeration order.
		if (resume) {
			let prior = null;
			try { prior = JSON.parse(await fs.promises.readFile(reportPath, 'utf8')); } catch { /* no checkpoint */ }
			if (!prior || prior.shard !== shard || !prior.lastKey) {
				throw new Error(`--resume: no usable checkpoint at ${reportPath}`);
			}
			if (prior.identity && prior.identity !== identity) {
				throw new Error('--resume: file identity changed since the checkpoint; run a full bulk pass instead');
			}
			const idx = entries.findIndex(e => e.key === prior.lastKey);
			if (idx < 0) throw new Error(`--resume: checkpoint key not found in the current index: ${prior.lastKey}`);
			entries = entries.slice(idx + 1);
			console.log(`B"H [convert] shard=${shard} resuming after ${prior.lastKey} (${idx + 1} keys already done)`);
		}

		// Choose the write path once: batch wrapper (M1 shardStore)
		// when deployed, else the engine's own batch, else plain puts.
		let putPath = 'store.put';
		if (!dryRun) {
			if (typeof store.putMany === 'function') putPath = 'store.putMany';
			else if (typeof store.openDb().batch === 'function') putPath = 'engine.batch+store.put';
		}
		const putChunk = items => {
			const records = items.map(({ key, envelope }) => ({
				shard,
				parts: ['records', key],
				value: envelope,
				meta: { compat: 'awtsmoosdb-shard' }
			}));
			if (putPath === 'store.putMany') store.putMany(records);
			else if (putPath === 'engine.batch+store.put') store.openDb().batch(() => { for (const r of records) store.put(r); });
			else for (const r of records) store.put(r);
		};

		Object.assign(report, {
			identity,
			highWater,
			sinceOffset: topup ? sinceOffset : null,
			enumerated: fullTotal,
			selected: entries.length,
			putPath: dryRun ? '(dry)' : putPath
		});
		console.log(`B"H [convert] shard=${shard} mode=${report.mode} file=${file}`);
		console.log(`B"H [convert] vessel=${report.vessel} enumerated=${fullTotal} selected=${entries.length} ` +
			`highWater=${highWater} identity=${identity} putPath=${report.putPath}`);

		// Step 3: offset-read each live line and put it verbatim,
		// chunked, yielding to the event loop between chunks.
		const fh = await fs.promises.open(file, 'r');
		let processed = 0;
		let puts = 0;
		let tombstones = 0;
		let bytesRead = 0;
		let lastKey = null;
		const readErrors = [];
		let minErrorOffset = Infinity;
		let chunk = [];
		const flushChunk = async () => {
			if (!chunk.length) return;
			if (!dryRun) putChunk(chunk);
			puts += chunk.length;
			chunk = [];
			Object.assign(report, {
				processed, puts, tombstones, bytesRead,
				readErrorCount: readErrors.length, lastKey, updatedAt: Date.now()
			});
			await writeJson(reportPath, report);
			await new Promise(r => setImmediate(r));
		};
		try {
			let sizeNow = (await fh.stat()).size;
			for (const { key, offset } of entries) {
				let parsed = null;
				try { parsed = await readLineAtFd(fh, offset, sizeNow); } catch { parsed = null; }
				if (!parsed || !parsed.record || parsed.record.key !== key) {
					// Fail closed, like findIndexed does on index/file
					// skew: never invent or skip silently. A torn final
					// line (bulk pass racing a live append) lands here;
					// the stop-window top-up from minErrorOffset fixes it.
					readErrors.push({ key, offset });
					if (offset < minErrorOffset) minErrorOffset = offset;
					continue;
				}
				if (parsed.record.op === 'del') tombstones++;
				bytesRead += parsed.bytes;
				chunk.push({ key, envelope: parsed.record });
				processed++;
				lastKey = key;
				if (chunk.length >= batchSize) {
					await flushChunk();
					sizeNow = (await fh.stat()).size;
				}
				if (processed % progressEvery === 0) {
					const secs = Math.max(0.001, (Date.now() - startedAt) / 1000);
					console.log(`B"H [convert] shard=${shard} processed=${processed}/${entries.length} puts=${puts} ` +
						`bytes=${bytesRead} elapsed=${secs.toFixed(1)}s rate=${(processed / secs).toFixed(1)}/s lastKey=${key}`);
				}
			}
			await flushChunk();
		} finally {
			try { await fh.close(); } catch { /* ignore */ }
		}

		// Durability checkpoint before verification reads.
		if (!dryRun) {
			try { store.openDb().waitForIdle(); } catch { /* engine-dependent; puts are already synchronous */ }
		}

		// Step 4: verification — vessel count vs expected logical
		// keys, plus a spot hash of sampled envelopes (JSONL line vs
		// vessel record, canonical-JSON sha256). Counts are read
		// keys-only (store.count / DosDBBridge.list) so the core
		// shard's live set is never materialized for a census.
		let vesselCount = -1;
		let countVia = '(dry)';
		let spotChecked = 0;
		let spotMismatches = 0;
		if (!dryRun) {
			if (typeof store.count === 'function') {
				vesselCount = store.count({ shard });
				countVia = 'store.count';
			} else {
				try {
					if (!/^[A-Za-z]+$/.test(shard)) throw new Error('shard name needs path encoding');
					vesselCount = store.openDb().DosDB.list(shard, { rootKey: store.info().rootKey }).length;
					countVia = 'DosDBBridge.list';
				} catch {
					vesselCount = store.list({ shard }).length;
					countVia = 'store.list (full materialization)';
				}
			}
			if (spotCount > 0 && allEntries.length) {
				const stride = Math.max(1, Math.floor(allEntries.length / spotCount));
				const sample = [];
				for (let i = 0; i < allEntries.length && sample.length < spotCount; i += stride) sample.push(allEntries[i]);
				if (sample[sample.length - 1] !== allEntries[allEntries.length - 1]) sample.push(allEntries[allEntries.length - 1]);
				for (const { key, offset } of sample) {
					const jsonlEnvelope = await readLineAt(file, offset);
					const vesselEnvelope = store.get({ shard, parts: ['records', key] })?.value || null;
					spotChecked++;
					if (!jsonlEnvelope || !vesselEnvelope || hashOf(jsonlEnvelope) !== hashOf(vesselEnvelope)) spotMismatches++;
				}
			}
		}
		const expected = expectedArg >= 0 ? expectedArg : fullTotal;
		const countOk = dryRun ? true : vesselCount === expected;
		const pass = readErrors.length === 0 && countOk && spotMismatches === 0;

		Object.assign(report, {
			processed, puts, tombstones, bytesRead,
			readErrorCount: readErrors.length,
			readErrors: readErrors.slice(0, 50),
			minErrorOffset: readErrors.length ? minErrorOffset : null,
			vesselCount, countVia, expected,
			spotChecked, spotMismatches,
			finishedAt: Date.now(),
			result: pass ? 'PASS' : 'FAIL'
		});
		await writeJson(reportPath, report);
		console.log(`HIGH_WATER_OFFSET=${highWater}`);
		console.log(`FILE_IDENTITY=${identity}`);
		console.log(`CONVERT-RESULT shard=${shard} mode=${report.mode} enumerated=${fullTotal} selected=${entries.length} ` +
			`processed=${processed} puts=${puts} tombstones=${tombstones} readErrors=${readErrors.length} ` +
			`vesselCount=${vesselCount} expected=${expected} countVia=${countVia} ` +
			`spotChecked=${spotChecked} spotMismatches=${spotMismatches} result=${pass ? 'PASS' : 'FAIL'}`);
		if (readErrors.length) {
			console.log(`B"H [convert] remedy for read errors: after stopping the service, re-run with ` +
				`--topup --since-offset=${minErrorOffset} --expect-identity=${identity}`);
		}
		process.exitCode = pass ? 0 : 1;
	} finally {
		releaseLock();
		if (!dryRun) { try { store.close(); } catch { /* ignore */ } }
	}
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
