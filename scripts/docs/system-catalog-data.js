//B"H
//Boruch Hashem
//Blessed is He

/** @file system-catalog-data.js @description The Awtsmoos lets persistence contracts be named as stable concepts while changing counts remain generated evidence. */

module.exports = [
	{
		id: "database-root-resolution", district: "data", title: "Database Root Resolution",
		summary: "How the runtime chooses the persistence root before DosDB or newer storage layers operate.",
		manuals: ["docs/DATA/README.md", "docs/DATA/PATH_CONTRACTS.md"],
		projects: ["ayzarim/awtsmoosDynamicServer"],
		sources: ["ayzarim/awtsmoosDynamicServer/server/initDb.js"],
		generated: ["docs/GENERATED/ENVIRONMENT_VARIABLES.md"],
		tags: ["persistence", "environment", "path", "migration"],
		claimsBoundary: "Environment names and inspected manuals describe precedence; no environment value is read or published.",
		changeRisk: "Changing root precedence or defaults can redirect an existing deployment to different persisted data."
	},
	{
		id: "dosdb-filesystem", district: "data", title: "DosDB Filesystem Storage",
		summary: "The legacy filesystem-oriented database layer and its compatibility surface.",
		manuals: ["docs/DATA/DOSDB.md", "docs/DATA/README.md"], projects: ["ayzarim/DosDB"],
		sources: ["ayzarim/DosDB/index.js"], generated: ["docs/GENERATED/PROJECT_TUTORIAL_INDEX.md"],
		tags: ["persistence", "filesystem", "compatibility"],
		claimsBoundary: "Project and source presence establish implementation location, not the complete physical format of every persisted record.",
		changeRisk: "Filesystem layout and compatibility behavior can be migration-sensitive."
	},
	{
		id: "awtsmoos-binary-json", district: "data", title: "AwtsmoosBinaryJSON",
		summary: "Binary JSON serialization used inside the broader DosDB/Awtsmoos storage family.",
		manuals: ["docs/DATA/DOSDB.md", "docs/DATA/AWTSMOOSDB_AND_VIRTUALFS.md"], projects: ["ayzarim/DosDB"],
		sources: ["ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js"], generated: [],
		tags: ["persistence", "serialization", "compatibility", "migration"],
		claimsBoundary: "The catalog identifies the serializer boundary; exact byte-level semantics remain source and format-contract questions.",
		changeRisk: "Serialization changes can make existing persisted bytes unreadable or semantically incompatible."
	},
	{
		id: "awtsmoosdb-virtualfs", district: "data", title: "AwtsmoosDB and VirtualFs",
		summary: "The newer `.awtsdb` storage engine and its virtual filesystem interface.",
		manuals: ["docs/DATA/AWTSMOOSDB_AND_VIRTUALFS.md", "docs/DATA/README.md"], projects: ["ayzarim/DosDB"],
		sources: ["ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js", "ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/VirtualFs.js"],
		generated: [], tags: ["persistence", "virtualfs", "awtsmoosdb", "migration"],
		claimsBoundary: "Source paths establish the engine/interface boundary; generated docs do not infer transaction or consistency guarantees.",
		changeRisk: "Storage-engine, manifest, transaction, or path changes require compatibility review."
	},
	{
		id: "social-packed-storage", district: "data", title: "Social Packed Storage",
		summary: "Packed Social persistence, bridges, shards, snapshots, and migration helpers used around posts/comments/series.",
		manuals: ["docs/DATA/README.md", "docs/DATA/PATH_CONTRACTS.md"], projects: ["geelooy/api/social"],
		sources: ["geelooy/api/social/_awtsmoos.packed.js", "geelooy/api/social/helper/packed/socialPacked.js", "geelooy/api/social/helper/packed/awtsmoosDbFsBridge.js"],
		generated: ["docs/GENERATED/PROJECT_TUTORIAL_INDEX.md"], tags: ["persistence", "social", "packed", "migration"],
		claimsBoundary: "Packed-engine files show implementation families; logical Social semantics still belong to Social handlers and manuals.",
		changeRisk: "Shard, manifest, snapshot, or migration changes can affect existing Social content."
	},
	{
		id: "persistence-path-contracts", district: "data", title: "Persistence Path Contracts",
		summary: "Logical path shapes that behave like compatibility contracts across persisted Social and runtime data.",
		manuals: ["docs/DATA/PATH_CONTRACTS.md", "docs/DATA/README.md"], projects: ["geelooy/api/social", "ayzarim/DosDB"],
		sources: ["geelooy/api/social/helper/packed/shardPaths.js", "ayzarim/awtsmoosDynamicServer/server/initDb.js"], generated: [],
		tags: ["persistence", "path", "compatibility", "migration"],
		claimsBoundary: "Human path-contract documentation supplies interpretation; source paths merely anchor where path rules are implemented.",
		changeRisk: "Renaming or re-rooting persisted paths can silently strand existing data without migration."
	},
	{
		id: "parallel-awtsmoosdb", district: "data", title: "Parallel AwtsmoosDB Bridge",
		summary: "The DosDB-side bridge that exposes a parallel AwtsmoosDB path for newer database capabilities.",
		manuals: ["docs/DATA/README.md", "docs/DATA/AWTSMOOSDB_AND_VIRTUALFS.md"], projects: ["ayzarim/DosDB"],
		sources: ["ayzarim/DosDB/awtsmoosDbBridge.js"], generated: [],
		tags: ["persistence", "awtsmoosdb", "bridge"],
		claimsBoundary: "Bridge presence does not mean all legacy DosDB callers use the newer engine.",
		changeRisk: "Bridge selection/fallback changes can alter which physical storage family receives writes."
	}
];
