# B"H — Comments Tests (geelooy/api/social/helper/comments/test/)

The full comment-system test suite (21 files).

- `runAllCommentsTests.js` — runs the whole suite.
- Creation/policy: `commentSubmissionPolicy.test.js`, `commentCreationSidecarRead.test.js`.
- Reading: `richCommentReader.test.js`, `richCommentTreeCascade.test.mjs`, `commentTreeSectionEditDelete.test.js`, `commentDerivedPriority.test.js`, `awtsmoosDbRichRouting.test.js`.
- Indexing/search: `commentIndexingRoute.test.js`, `commentSearchRoute.test.js`.
- Migration: `commentMigration.test.js`, `legacyMigrationGuard.test.js`, `legacyRichCompatibility.test.js`, `commentAwtsmoosDbBridge.test.js`, `commentShardAuthorCatalog.test.js`, `commentShardProcessIsolation.test.js`.
- Translations: `translationBundles.test.js`, `translationCoverage.test.js`, `translationRoutes.test.js`.
- Imported: `richImportedRoute.test.js`, `importedBundleFixture.js`.
