//B"H
//Boruch Hashem
//Blessed be He
/** Generated server catalog index. Do not hand-edit. */
const shards = [
	require("./shard-1.generated.js"),
	require("./shard-2.generated.js"),
	require("./shard-3.generated.js"),
	require("./shard-4.generated.js"),
	require("./shard-5.generated.js"),
	require("./shard-6.generated.js"),
	require("./shard-7.generated.js"),
	require("./shard-8.generated.js"),
	require("./shard-9.generated.js"),
	require("./shard-10.generated.js"),
	require("./shard-11.generated.js"),
	require("./shard-12.generated.js"),
	require("./shard-13.generated.js"),
	require("./shard-14.generated.js"),
	require("./shard-15.generated.js")
];
const records = Object.freeze(shards.flat());
module.exports = {
	records,
	apps: Object.freeze(records.filter(record => record.kind === "app")),
	games: Object.freeze(records.filter(record => record.kind === "game"))
};
