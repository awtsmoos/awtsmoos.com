# B"H — Drive Migration (geelooy/api/social/helper/drive/migration/)

Data-migration pipeline for Drive: scan a source tree, import items into Drive, and verify/roll back with atomic receipts.

## Files
- `sourceTreeScanner.js`, `sourcePathPolicy.js`, `sourceFileIdentity.js`, `sourceFileHasher.js` — scan and identify source files.
- `migrationManifest.js`, `migrationImportSupport.js`, `migrationImporter.js`, `migrationItemImporter.js`, `migrationItemPolicy.js`, `migrationItemWriter.js` — import pipeline.
- `migrationReceiptFile` (`atomicReceiptFile.js`), `migrationReceiptRepository.js`, `migrationReceiptStates.js`, `migrationReceiptShape.js`, `migrationReceiptLock.js` — atomic receipt tracking.
- `migrationRollback.js`, `migrationRollbackState.js` — rollback.
- `migrationVerifier.js` — post-import verification.
- `migrationRateController.js`, `migrationDestinationSnapshot.js` — rate control and destination snapshots.

## Tests
`../test/migration/` — accounting, importer, manifest, rate controller/recovery, receipts, rollback, hasher, path policy, tree scanner.
