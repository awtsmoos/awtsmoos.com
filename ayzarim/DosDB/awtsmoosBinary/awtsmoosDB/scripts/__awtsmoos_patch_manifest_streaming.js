// B"H
const fs = require('fs');
const p = 'scripts/migrate_dayuh_chadash_full.js';
let s = fs.readFileSync(p, 'utf8');

function rep(find, replace) {
  if (!s.includes(find)) throw new Error('Missing pattern: ' + find.slice(0, 120));
  s = s.replace(find, replace);
}

rep("const FAMILY_SUFFIXES = ['', '.wal', '.sparse.json', '.turbo.json', '.turbo.log', '.turbo.tree.json', '.lock', '.txn.json'];",
    "const FAMILY_SUFFIXES = ['', '.wal', '.sparse.json', '.turbo.json', '.turbo.log', '.turbo.tree.json', '.lock', '.txn.json', '.manifest.jsonl'];");

rep("  precreateDirs: false,\n  cacheParents: true\n};",
    "  precreateDirs: false,\n  cacheParents: true,\n  manifestInDb: false,\n  manifestJsonl: true\n};");

rep("  precreateDirs: false,\n  cacheParents: true,\n  manifestInDb: false,\n  manifestJsonl: true\n};\nconst SAFE_DEFAULTS",
    "  precreateDirs: false,\n  cacheParents: true,\n  manifestInDb: false,\n  manifestJsonl: true\n};\nconst SAFE_DEFAULTS");

// SAFE_DEFAULTS still has the old two-line ending; patch it separately if present.
s = s.replace("  precreateDirs: false,\n  cacheParents: true\n};\n\nfunction main()",
              "  precreateDirs: false,\n  cacheParents: true,\n  manifestInDb: true,\n  manifestJsonl: true\n};\n\nfunction main()");

rep("  const cacheParents = boolArg(args.cacheParents, defaults.cacheParents);\n  const dbOptions = {",
    "  const cacheParents = boolArg(args.cacheParents, defaults.cacheParents);\n  const manifestInDb = boolArg(args.manifestInDb, defaults.manifestInDb);\n  const manifestJsonl = boolArg(args.manifestJsonl, defaults.manifestJsonl);\n  const manifestFile = `${out}.manifest.jsonl`;\n  const dbOptions = {");

rep("  log(`dryRun=${dryRun} verbose=${verbose} progress=${progress} valueHash=${hashValues} precreateDirs=${precreateDirs} cacheParents=${cacheParents}`);",
    "  log(`dryRun=${dryRun} verbose=${verbose} progress=${progress} valueHash=${hashValues} precreateDirs=${precreateDirs} cacheParents=${cacheParents} manifestInDb=${manifestInDb} manifestJsonl=${manifestJsonl}`);");

rep("    backupExisting(out);\n    removeFamily(out);",
    "    backupExisting(out);\n    removeFamily(out);\n    if (manifestJsonl) fs.rmSync(manifestFile, { force: true });");

rep("  const stats = { totalBytes: 0, decoded: 0, json: 0, text: 0, blobs: 0, lastFlushAt: 0 };",
    "  const stats = { totalBytes: 0, decoded: 0, json: 0, text: 0, blobs: 0, migrated: 0, lastFlushAt: 0 };");

rep("        manifest.push({\n          rel: item.rel,\n          id: item.id,\n          storeId,\n          kind: imported.kind,\n          bytes: raw.length,\n          sha256: hash,\n          valueHash: imported.valueHash || null,\n          error: imported.error || null\n        });",
    "        const manifestEntry = {\n          rel: item.rel,\n          id: item.id,\n          storeId,\n          kind: imported.kind,\n          bytes: raw.length,\n          sha256: hash,\n          valueHash: imported.valueHash || null,\n          error: imported.error || null\n        };\n        stats.migrated++;\n        if (manifestJsonl) fs.appendFileSync(manifestFile, JSON.stringify(manifestEntry) + '\\n');\n        if (manifestInDb || verifySamples > 0) manifest.push(manifestEntry);");

s = s.replace(/files: manifest\.length,/g, "files: stats.migrated,");
s = s.replace(/current: manifest\.length,/g, "current: stats.migrated,");
s = s.replace("      dbOptions,\n      createdAt: new Date().toISOString(),\n      manifest\n    };",
              "      dbOptions,\n      manifestFile: manifestJsonl ? manifestFile : null,\n      manifestInDb,\n      createdAt: new Date().toISOString(),\n      manifest: manifestInDb ? manifest : []\n    };");
s = s.replace("summary files=${manifest.length}/${files.length}", "summary files=${stats.migrated}/${files.length}");

fs.writeFileSync(p, s);
console.log('patched streaming manifest');
