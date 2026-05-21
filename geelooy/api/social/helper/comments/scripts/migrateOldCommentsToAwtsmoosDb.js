#!/usr/bin/env node
// B"H
/**
 * @file migrateOldCommentsToAwtsmoosDb.js
 * @description
 * Theoretical/operational migration harness. It is intentionally a helper,
 * not an auto-runner: provide a real `$i` from the server/runtime or import
 * `runCommentMigration` in a controlled script. Existing comments are read
 * from old alias/verse paths and mirrored into the AwtsmoosDB AI sidecar.
 */

const { migrateParentCommentsToAwtsmoosDb } = require("../commentMigration.js");

async function runCommentMigration({
    $i,
    heichelId,
    seriesId,
    parentId,
    parentType = "post",
    postId,
    storageFormat = "awtsmoosBinary",
    legacySourceFormat = "awtsmoosJson"
}) {
    return await migrateParentCommentsToAwtsmoosDb({
        $i,
        heichelId,
        seriesId,
        parentId,
        parentType,
        postId,
        storageFormat,
        legacySourceFormat
    });
}

if (require.main === module) {
    console.log(JSON.stringify({
        BH: "B\"H",
        message: "Import runCommentMigration({ $i, heichelId, seriesId, parentId, ... }) inside the Awtsmoos runtime. This script does not guess DB wiring from the shell.",
        storageFormat: "awtsmoosBinary",
        legacySourceFormat: "awtsmoosJson"
    }, null, 2));
}

module.exports = { runCommentMigration };
