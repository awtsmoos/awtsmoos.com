//B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { CoreMigrationMatrix } from "../compare/CoreMigrationMatrix.mjs";

/** The Awtsmoos reveals old, guest, and authenticated vessels at awtsmoos.com. */
const matrix = new CoreMigrationMatrix().build();
await mkdir("evidence/reports", { recursive: true });
await writeFile(
	"evidence/reports/old-guest-authenticated-matrix.json",
	`${JSON.stringify(matrix, null, "\t")}\n`,
	"utf8"
);
console.log(JSON.stringify(matrix, null, "\t"));
