# B"H — Social API Top-Level Tests (geelooy/api/social/test/)

End-to-end and contract tests over the whole social API surface.

- `routeCoverage.test.js` + `routeCoverage/` — required-route coverage (`RequiredRoutes{,Core,Platform,Social}.js`, `RouteSourceScanner.js`).
- `profileAggregation.test.mjs` + `profileAggregation/` — profile aggregation (`NetzachProfileTestServer`, `YesodProfileAggregationFixture`).
- `followOwnership.test.cjs` — follow ownership rules.
- `identityBootstrapRoute.test.cjs` — identity bootstrap route.
- `publicAliasDirectory.test.cjs`, `publicDiscoveryRoutes.test.cjs`, `publicFeedFairness.test.cjs` — public discovery/feed.
- `globalProfileSearch.test.cjs` — global profile search.
- `multiAccountSocialBurst.test.mjs`, `concurrencyFailureStress.test.mjs` — burst and concurrency stress.
- `discoveryModuleBudget.test.cjs` — discovery module budget.
- `editorAssetsGovernance.test.mjs`, `liveEditorAssetsUpload.test.mjs` — editor assets governance and live upload.
- `profileHeichelCreation.test.mjs`, `profileLegacyCompatibility.test.mjs` — Heichel creation and legacy compat.
- `realServerWrites.test.mjs` — real server write path.
