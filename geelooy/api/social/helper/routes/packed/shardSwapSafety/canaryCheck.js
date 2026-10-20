//B"H
//Blessed is He
//Boruch Hashem

/** @module ShardSwapCanary
 * Pre-swap canary for AwtsmoosDB shard files.
 *
 * WHY THIS EXISTS (2026-10-20): a gc'd series shard was swapped into
 * production unchecked. The service STARTED, but every series read
 * hung forever (event loop wedged, 0 bytes on a local curl). Only a
 * manual restore of the backup saved the site. From now on a
 * candidate shard must PROVE it serves reads before it may replace
 * a live shard — see README.md in this directory for the protocol.
 *
 * WHAT IT DOES:
 *   1. Copies the candidate to a scratch file (never opens the live
 *      or candidate file in place; opens only the copy).
 *   2. Opens the copy with the exact production options used by
 *      awtsmoosDbFsBridge.openHeichelFsDb.
 *   3. Lists the virtual-FS root and cats a probe record.
 *   4. Prints CANARY_PASS / CANARY_FAIL and exits 0 / 1.
 *
 * A corrupt shard may HANG this process instead of throwing — always
 * run it under `timeout 60`. Markers go to stderr so the hang point
 * is visible in the output.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

/** @constant {string} Repo root, derived from this file's location. */
const REPO_ROOT = path.resolve(__dirname, '../../../../../../../');
const DB_INDEX = path.join(REPO_ROOT,
	'ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const V3_READ = path.join(REPO_ROOT,
	'ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/read.js');

/**
 * Log a progress marker to stderr (hang-point visibility).
 * @param {string} msg
 */
function mark(msg) { process.stderr.write('[canary] ' + msg + '\n'); }

/**
 * Run the canary against a candidate shard file.
 * @param {string} candidate Absolute path of the candidate shard.
 * @param {string} probePath Virtual-FS path of a record that must read.
 * @returns {number} Process exit code (0 = pass).
 */
function run(candidate, probePath) {
	if (!fs.existsSync(candidate)) {
		mark('FAIL: candidate not found: ' + candidate);
		return 1;
	}
	const copy = path.join(os.tmpdir(),
		'canary-' + Date.now() + '-' + path.basename(candidate));
	mark('copying candidate -> ' + copy);
	fs.copyFileSync(candidate, copy);
	const AwtsmoosDB = require(DB_INDEX);
	const { list, cat } = require(V3_READ);
	mark('opening copy with production options');
	const database = new AwtsmoosDB(copy, {
		compression: false,
		reuseFreedSpace: 'verified',
		versions: false,
		virtualFsCompression: true,
		wal: false
	});
	database.open();
	database.fs.ready();
	mark('listing virtual root "/"');
	const entries = list(database.fs, '/');
	if (!Array.isArray(entries) || !entries.length) {
		mark('FAIL: virtual root listing is empty');
		return 1;
	}
	mark('root entries: ' + entries.length);
	mark('catting probe: ' + probePath);
	const bytes = cat(database.fs, probePath);
	if (!bytes || !bytes.length) {
		mark('FAIL: probe record read back empty: ' + probePath);
		return 1;
	}
	mark('probe bytes: ' + bytes.length);
	try { database.pager && database.pager.close && database.pager.close(); } catch (_) {}
	try { fs.unlinkSync(copy); } catch (_) {}
	process.stdout.write('CANARY_PASS\n');
	return 0;
}

if (require.main === module) {
	const args = process.argv.slice(2);
	const candidate = args[0];
	const probePath = args[1] || '/';
	if (!candidate) {
		process.stderr.write('usage: timeout 60 node canaryCheck.js <candidateShard> [probeVirtualPath]\n');
		process.exit(2);
	}
	try {
		process.exit(run(candidate, probePath));
	} catch (error) {
		mark('FAIL: ' + (error && error.stack || error));
		process.stdout.write('CANARY_FAIL\n');
		process.exit(1);
	}
}

module.exports = { run };
