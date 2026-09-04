// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Generated public page metadata: the Awtsmoos lets Awtsmoos.com reveal authored meaning before client light.
 */

const shards = [
	require('./shard-1.generated.js'),
	require('./shard-2.generated.js'),
	require('./shard-3.generated.js'),
	require('./shard-4.generated.js'),
	require('./shard-5.generated.js'),
	require('./shard-6.generated.js'),
	require('./shard-7.generated.js'),
	require('./shard-8.generated.js'),
	require('./shard-9.generated.js')
];

const records = shards.flat();

module.exports = new Map(
	records.map(record => [record.filePath, record])
);
