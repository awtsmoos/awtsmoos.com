// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentShardReader
 * @description
 * Classifies exact commentary families and delegates heavy AWTSDB decoding to a
 * disposable worker process. The API process receives only the requested JSON
 * payload and never imports the shard database engine into its own heap.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('node:child_process');

const WORKER = path.join(__dirname, 'commentShardWorker.js');
const TALMUD = /^(berakhot|shabbat|eiruvin|pesachim|yoma|sukkah|beitzah|rosh_hashanah|taanit|megillah|moed_katan|chagigah|yevamot|ketubot|nedarim|nazir|sotah|gittin|kiddushin|bava_|sanhedrin|makkot|shevuot|avodah_zarah|horayot|zevachim|menachot|chullin|bekhorot|arachin|arakhin|temurah|keritot|meilah|tamid|middot|niddah)/;
const TANACH = /^(bereshis|shemos|vayikra|bamidbar|devarim|yehoshua|shoftim|shmuel|melachim|yeshayahu|yirmiyahu|yechezkel|hoshea|yoel|amos|ovadiah|yonah|micha|nachum|chabakuk|tzefaniah|chaggai|zechariah|malachi|tehillim|mishlei|iyov|shir_hashirim|rus|eicha|koheles|ester|daniel|ezra|nechemia|divrei_hayamim)/;
const CHASSIDUS = /(_meluket$|^BH-seferHamaamarimMeluket-|^likkuteiSichos|^likkuteiSichosVolume|^chassidus|^derechMitzvosecha|^hayomYom|^imreiBina|^keserShemTov|^kuntress|^maamarim|^seferHasichos|^torahOhr|^likkuteiTorah|^tanya)/;

function encodePart(value) {
	return encodeURIComponent(String(value ?? 'root')).replace(/%/g, '~');
}

function safeAliasFile(aliasId) {
	return encodePart(aliasId).replace(/[^A-Za-z0-9_.~-]/g, '_');
}

function shardRoot(context) {
	const root = context?.$i?.db?.directory;
	return root ? path.join(root, 'socialPacked', 'commentShards') : null;
}

function familyForSeries(seriesId) {
	const value = String(seriesId || '');
	if (TALMUD.test(value)) return 'talmudBavli';
	if (TANACH.test(value)) return 'tanach';
	if (CHASSIDUS.test(value)) return 'chassidus';
	if (/^mishnah/.test(value)) return 'mishnah';
	return null;
}

function shardFile(context, aliasId) {
	const root = shardRoot(context);
	const family = familyForSeries(context?.seriesId);
	return root && family
		? path.join(root, family, `${safeAliasFile(aliasId)}.comments.fs.awtsdb`)
		: null;
}

function readVirtualFile(file, virtualPath) {
	if (!usableFile(file) || !validVirtualPath(virtualPath)) return null;
	const request = Buffer.from(JSON.stringify({ file, virtualPath })).toString('base64url');
	const result = spawnSync(process.execPath, [WORKER, request], {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
		timeout: 30000,
		windowsHide: true
	});
	if (result.error || result.status !== 0 || !result.stdout) return null;
	try {
		const response = JSON.parse(result.stdout);
		return response.ok ? response.data : null;
	} catch {
		return null;
	}
}

function aliasFiles(context) {
	const root = shardRoot(context);
	const family = familyForSeries(context?.seriesId);
	if (!root || !family) return [];
	try {
		return fs.readdirSync(path.join(root, family))
			.filter(file => file.endsWith('.comments.fs.awtsdb'))
			.map(file => file.replace(/\.comments\.fs\.awtsdb$/i, ''));
	} catch {
		return [];
	}
}

function validVirtualPath(value) {
	return typeof value === 'string' && value.startsWith('/bySeries/');
}

function usableFile(file) {
	try {
		return Boolean(file) && fs.statSync(file).size > 0;
	} catch {
		return false;
	}
}

module.exports = {
	aliasFiles,
	encodePart,
	familyForSeries,
	readVirtualFile,
	safeAliasFile,
	shardFile,
	shardRoot,
	validVirtualPath
};
