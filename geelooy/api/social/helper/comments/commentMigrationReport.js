//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentMigrationReport
 * @description Migration report builders (split from commentMigration.js, verbatim).
 */

function makeReport({ dryRun, parentBasePath, fastMode, indexSearch }) {
    return {
        success: true,
        dryRun,
        fastMode,
        indexSearch,
        parentBasePath,
        aliasesSeen: 0,
        versesSeen: 0,
        copied: 0,
        migrated: 0,
        indexed: 0,
        sharded: 0,
        vectors: 0,
        vectorSkipped: 0,
        alreadyPresent: 0,
        skipped: 0,
        packedMirrorWritten: false,
        errors: []
    };
}

function compactReport(report) {
    return {
        aliasesSeen: report.aliasesSeen,
        versesSeen: report.versesSeen,
        copied: report.copied,
        migrated: report.migrated,
        indexed: report.indexed,
        sharded: report.sharded,
        vectors: report.vectors,
        vectorSkipped: report.vectorSkipped,
        alreadyPresent: report.alreadyPresent,
        skipped: report.skipped,
        packedMirrorWritten: false,
        errors: report.errors.length
    };
}

module.exports = {
	makeReport,
	compactReport,
};
