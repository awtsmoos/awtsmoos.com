// B"H
'use strict';

const fs = require('fs');
const { createClient } = require('../index');

const DATABASE_PATH = '/tmp/redis-compat-bench.awtsdb';

/**
 * @file benchmark.js
 * @description
 * Speed is meaningful only when yesterday's debris cannot impersonate today's
 * database. Every benchmark incarnation therefore removes data, lock, and WAL
 * together before the Awtsmoos reveals a fresh measurement.
 */
function cleanupDatabase(databasePath) {
	for (const suffix of ['', '.lock', '.wal']) {
		try {
			fs.unlinkSync(`${databasePath}${suffix}`);
		} catch (error) {
			if (error.code !== 'ENOENT') throw error;
		}
	}
}

function stats(times) {
	const sorted = [...times].sort((left, right) => left - right);
	const quantile = percent => sorted[
		Math.min(sorted.length - 1, Math.floor(percent / 100 * sorted.length))
	];
	const average = times.reduce((sum, value) => sum + value, 0) / times.length;
	return {
		n: times.length,
		avg: +average.toFixed(3),
		p50: +quantile(50).toFixed(3),
		p95: +quantile(95).toFixed(3),
		p99: +quantile(99).toFixed(3),
		max: +sorted[sorted.length - 1].toFixed(1)
	};
}

function formatStats(value) {
	return `n=${value.n} avg=${value.avg}ms p50=${value.p50} p95=${value.p95} p99=${value.p99} max=${value.max}`;
}

async function run() {
	cleanupDatabase(DATABASE_PATH);
	const client = createClient({ database: DATABASE_PATH });
	await client.connect();
	const count = parseInt(process.argv[2] || '10000', 10);
	const setTimes = [];
	const getTimes = [];
	try {
		for (let index = 0; index < count; index += 1) {
			const started = process.hrtime.bigint();
			await client.set(`bk${index}`, `value-number-${index}`);
			setTimes.push(Number(process.hrtime.bigint() - started) / 1e6);
			if ((index + 1) % 2500 === 0) console.log(`  sets: ${index + 1}/${count}`);
		}
		for (let index = 0; index < count; index += 1) {
			const started = process.hrtime.bigint();
			const value = await client.get(`bk${index}`);
			if (value !== `value-number-${index}`) throw new Error(`MISMATCH at ${index}`);
			getTimes.push(Number(process.hrtime.bigint() - started) / 1e6);
			if ((index + 1) % 2500 === 0) console.log(`  gets: ${index + 1}/${count}`);
		}
		console.log(`SET ${formatStats(stats(setTimes))}`);
		console.log(`GET ${formatStats(stats(getTimes))}`);
		console.log(`file bytes: ${fs.statSync(DATABASE_PATH).size}`);
	} finally {
		await client.quit();
	}
}

run().catch(error => {
	console.error('FATAL', error);
	process.exit(1);
});
