# B"H — Meta Migration (geelooy/api/social/helper/migrations/meta/)

Importer for migrating Meta (Facebook/Instagram) assets and content into Awtsmoos.

## Files
- `MetaManifest.js`, `MetaManifestGuard.js` — migration manifest and validation guard.
- `MetaAssetGuard.js`, `MetaContentKind.js` — asset validation and content-kind mapping.
- `MetaMigrationPlan.js`, `MetaMigrationRoutes.js` — migration planning and HTTP routes.
- `MetaMigrationCapabilities.js`, `MetaMigrationDiagnostics.js` — capability checks and diagnostics.
- `MetaSourceProvenance.js`, `SecretFieldGuard.js` — provenance tracking and secret-field scrubbing.
