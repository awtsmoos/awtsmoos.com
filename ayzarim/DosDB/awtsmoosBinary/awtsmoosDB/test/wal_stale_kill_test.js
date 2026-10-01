// B"H
'use strict';

const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');
const Redis = require('../api/compat/redis/index.js');

const ENGINE = path.resolve(__dirname, '..');
const DB = '/tmp/awtsmoos-stale-kill.awtsdb';
const VICTIM = '/tmp/awtsmoos-stale-kill-victim.js';

/**
 * @file wal_stale_kill_test.js
 * @description
 * A murdered writer leaves one unfinished whisper in the WAL. Then its data
 * file is deliberately reborn beneath the same pathname. The Awtsmoos creates
 * the new incarnation now; yesterday's journal may not command today's file.
 */
function clean(includeWal = true) {
	for (const suffix of ['', '.lock', ...(includeWal ? ['.wal'] : [])]) {
		try { fs.unlinkSync(`${DB}${suffix}`); } catch (error) {
			if (error.code !== 'ENOENT') throw error;
		}
	}
}

function encoded(value) {
	return Buffer.from(value, 'utf8').toString('base64');
}

function victimSource() {
	const engine = encoded(`${ENGINE}/index.js`);
	const database = encoded(DB);
	return `'use strict';\nconst decode=x=>Buffer.from(x,'base64').toString('utf8');\n` +
		`const DB=require(decode('${engine}'));const db=new DB(decode('${database}'));db.open();\n` +
		`(async()=>{for(let i=0;;i++){db.root['k'+i]={i,v:'value-'+i};` +
		`if(i%200===0)console.log('w='+i);await new Promise(r=>setImmediate(r));}})();\n`;
}

async function waitForMixedState(child, output) {
	const deadline = Date.now() + 120000;
	while (Date.now() < deadline) {
		await new Promise(resolve => setTimeout(resolve, 2000));
		if (output.exited) throw new Error(`victim exited early: ${output.stderr.slice(-300)}`);
		const databaseBytes = fs.existsSync(DB) ? fs.statSync(DB).size : 0;
		const walBytes = fs.existsSync(`${DB}.wal`) ? fs.statSync(`${DB}.wal`).size : 0;
		const matches = output.stdout.match(/w=(\d+)/g);
		const writes = matches ? Number(matches.at(-1).slice(2)) : 0;
		if (databaseBytes > 1000000 && walBytes > 0 && writes > 600) {
			return { databaseBytes, walBytes, writes };
		}
	}
	throw new Error('mixed WAL/data state was not reached');
}

async function main() {
	clean();
	fs.writeFileSync(VICTIM, victimSource());
	const output = { stdout: '', stderr: '', exited: false };
	const child = fork(VICTIM, { silent: true });
	child.stdout.on('data', chunk => { output.stdout += chunk.toString(); });
	child.stderr.on('data', chunk => { output.stderr += chunk.toString(); });
	child.once('exit', () => { output.exited = true; });
	try {
		const mixed = await waitForMixedState(child, output);
		try { process.kill(child.pid, 'SIGKILL'); } catch (_error) {}
		await new Promise(resolve => setTimeout(resolve, 1500));
		clean(false);
		const client = Redis.createClient({ database: DB });
		await client.connect();
		for (let index = 0; index < 3000; index += 1) await client.set(`fresh${index}`, `v${index}`);
		for (let index = 0; index < 3000; index += 150) {
			if (await client.get(`fresh${index}`) !== `v${index}`) throw new Error(`mismatch ${index}`);
		}
		const report = client._db.verify();
		if (!report || !report.ok) throw new Error('verify failed after stale WAL rejection');
		await client.quit();
		console.log(`B"H wal_stale_kill_test PASS writes=${mixed.writes} db=${mixed.databaseBytes} wal=${mixed.walBytes}`);
	} finally {
		if (!output.exited) try { process.kill(child.pid, 'SIGKILL'); } catch (_error) {}
	}
}

main().finally(() => {
	clean();
	try { fs.unlinkSync(VICTIM); } catch (_error) {}
}).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
