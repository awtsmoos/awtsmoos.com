// B"H

const DiskCollection = require("./request-retry-disk-collection.js");

try {
	DiskCollection.collect(Number(process.argv[2] || Date.now()));
} catch {
	process.exitCode = 1;
}
