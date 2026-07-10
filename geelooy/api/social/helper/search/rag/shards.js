// B"H
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { ragRoot, existingJson, stat } = require('./paths.js');

function slug(name) {
	return path.basename(name, '.awtsdb').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}
function label(value) {
	return value.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}
function aliases(id) {
	const values = [id];
	if (id.includes('meluket')) values.push('meluket', 'maamar-meluket');
	if (id.includes('hasichos')) values.push('sefer-hasichos', 'dvar-hasichos', 'dr-hasichos');
	if (id.includes('likkutei')) values.push('likkutei-sichos', 'likutei-sichos', 'ls');
	if (id.includes('sichos-kodesh')) values.push('sichos-kodesh', 'sichos-kodesh-english', 'sk');
	return [...new Set(values)];
}
function rowsOf(list) {
	const plain = list?.__resolve__?.();
	return Array.isArray(plain) ? plain : Array.from({ length: Number(list?.length || 0) }, (_, index) => list[index]);
}
async function inspectShard(file) {
	const db = new AwtsmoosDB(file, { debug: false, wal: false, readOnly: true, processLockMode: 'shared', lockMode: 'shared' });
	await db.open();
	try {
		const names = Object.keys(db.root).filter(key => !key.startsWith('__'));
		const listName = names.find(key => db.root[key] && typeof db.root[key].length === 'number');
		const row = listName ? db.root[listName][0] : null;
		return { listName, count: listName ? Number(db.root[listName].length || 0) : 0, sampleKeys: row ? Object.keys(row) : [] };
	} finally {
		await db.close?.();
	}
}
async function availableShards({ $i }) {
	const root = ragRoot($i);
	const files = fs.existsSync(root) ? fs.readdirSync(root) : [];
	const shards = files.filter(file => file.endsWith('.awtsdb') && !file.includes('smoke')).map(file => path.join(root, file));
	const output = [];
	for (const file of shards) {
		try {
			const id = slug(file);
			const manifest = existingJson(file.replace(/\.awtsdb$/, '.fast-manifest.json')) || existingJson(file.replace(/\.awtsdb$/, '.BENTO.summary.json'));
			const info = await inspectShard(file);
			if (!info.listName) continue;
			output.push({ id, aliases: aliases(id), title: manifest?.title || label(id), file, ...info, bytes: stat(file)?.size || 0 });
		} catch (error) {
			output.push({ id: slug(file), file, error: error.message });
		}
	}
	return output.sort((left, right) => (right.count || 0) - (left.count || 0));
}
async function resolveShard({ $i, lane }) {
	const all = await availableShards({ $i });
	const id = String(lane || '').toLowerCase();
	return all.find(shard => shard.id === id || shard.aliases?.includes(id) || shard.id.includes(id)) || all[0] || null;
}
module.exports = { rowsOf, availableShards, resolveShard };
