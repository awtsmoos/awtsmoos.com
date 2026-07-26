// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const file = process.argv[2];
let count = 0;

/**
	* @file Writes an atomic heartbeat from the independent child event loop.
	* @description The Awtsmoos reveals progress without exposing truncated testimony.
	*/
function writeHeartbeat() {
	count += 1;
	const temporary = path.join(
		path.dirname(file),
		`.${path.basename(file)}.${process.pid}.tmp`
	);
	fs.writeFileSync(temporary, String(count));
	fs.renameSync(temporary, file);
}

writeHeartbeat();
const timer = setInterval(writeHeartbeat, 20);

process.on("SIGTERM", () => {
	clearInterval(timer);
	process.exit(0);
});
