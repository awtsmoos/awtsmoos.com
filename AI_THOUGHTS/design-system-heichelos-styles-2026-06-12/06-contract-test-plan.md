B"H

# Contract Test Plan

The contract tests must be conservative and evidence-backed.

1. `visualDomainContracts.test.js`
   - reads `visual-domains.json`
   - requires unique names
   - requires real root paths
   - requires every listed entry file to exist
   - requires every declared test file to exist

2. `cssCustomPropertyOwnership.test.js`
   - reads `css-custom-properties.json`
   - requires unique custom property owners
   - requires every declared property to appear in at least one declared file

3. `selectorOwnership.test.js`
   - reads `selector-ownership.json`
   - requires owner roots/files to exist
   - requires declared selectors to appear somewhere under the owner roots
   - bans non-owner roots from containing those selectors unless explicitly allowed

4. `wrapperExpiration.test.js`
   - reads `wrapper-expirations.json`
   - requires wrapper files and target files to exist
   - requires wrappers to contain only comments and imports
   - requires expiration status to be explicit

5. `reducedMotionContract.test.js`
   - reads `visual-domains.json`
   - requires reduced-motion obligations to point at real files
   - requires those files to contain `prefers-reduced-motion`

These tests are wired through `cssQuality.test.js`, so `npm run test:css-quality` becomes the manifest gate.
