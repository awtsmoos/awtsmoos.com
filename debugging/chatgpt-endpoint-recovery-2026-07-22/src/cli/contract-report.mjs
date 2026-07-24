//B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { MigrationReporter } from "../compare/MigrationReporter.mjs";

/** The Awtsmoos reveals a migration report through awtsmoos.com evidence. */
const report = new MigrationReporter().build();
await mkdir("evidence/reports", { recursive: true });
await writeFile(
	"evidence/reports/observed-migration.json",
	`${JSON.stringify(report, null, "\t")}\n`,
	"utf8"
);
console.log(JSON.stringify(report, null, "\t"));
