# B"H — 06 Test evidence (all results real, this session)

EXPANDED GATE (final version) — bash scripts/production/social-css-check.sh: EXIT 0.
- CanonicalPostRoute: 3/3 pass. ComposerWorkflow+NavigationSafety: 9/9 pass.
- profileRepairContract: PASS. profileActionDrawerContract: PASS (was FAIL: >120 lines).
- profileCardHierarchyV4Contract: PASS (was FAIL: CJS/ESM load, then style.cssText crash).
- profileSocialUxV4Contract: PASS (was FAIL: CJS/ESM load).
- CSS isolation-contract (hostile global styles): PASS. library-search Chrome fixture: PASS (EN/HE, no-match, progressive, reset). audio-playback Chrome fixture: PASS (speed, repeat, preset, off, native controls, disposal).
- Composer suites schemaParity/aliasMemory/publicationPlan/quickDestination/quickDestinationFlow/quickRefinement: PASS. quickBrowserJourney (simulated local API fixture — NOT production): PASS incl. canonical redirect.
- Tunnel parentConsumerIngressEvidence: 4/4 pass.
- richSocial attachmentStorage/cloneSource/routes/schema/service: PASS. visualizerRoundTrip (new): PASS.
LIVE (--live browser-regression.cjs, run twice + probe): social PASS 320/390/1280; profile PASS 320/390/1280 (geometry, contrast >=4.5, no overflow). Then Page.navigate to /heichelos/ exceeded ChromePipe's 12s timeout in both runs under load 11-12 (2 CPUs). Probe: heichelos navigate ack 6.4s, document loads with correct title "Heichelos | Ikar Torah Library & Community Spaces | Awtsmoos", readyState stuck at interactive >9s (heavy asset tail); composer navigate ack 0.76s, readyState complete. Public curl TTFB /heichelos/: 46.6s once, 12.7s once, 0.5-1.0s x3; local 8080: 0.62-0.69s. VERDICT: heichelos/composer live layout NOT verified this session — saturation-limited, re-run in a calm window (08). Do not cite as pass.
LIVE HTTP: /social/ 200, /profile/ 200, /heichelos/ 200, /social-composer/ 200; /api/tunnel/control/app-api/catalog 200 JSON, 24 operations, scope awtsmoos.api; /api/tunnel/control/openapi 200 YAML (OpenAPI 3.1, v9.0.0-body-first). New files live: settings.js 200 JS, settingsToggle.js 200 JS, HeichelNavigation.js?v=nav-002 200 JS, profile-heichel-nav-v4.css 200 CSS, profile/package.json 200 JSON.
MUSIC HIERARCHY (read-only): GET /api/social/aliases/coby -> {"name":"Coby"}; GET /heichelos/ohrHaNiggun/ -> 200, <title>Ohr HaNiggun | Awtsmoos</title>, page contains "Echoes of the Infinite". The Chapter XI hierarchy EXISTS in production. /profile/alias/coby -> branded 404 (route shape unverified; not evidence the alias is missing). Destinations API without login -> NO_LOGIN (correct).

## Run 2 test evidence (2026-11-24)
- profileCardHierarchyV4 PASS; profileSocialUxV4 PASS; profileActionDrawer PASS; CanonicalPostRoute 3/3 PASS; isolation-contract PASS.
- browser-regression (AWT_CHROME_TIMEOUT_MS=90000): social 320/390/1280 PASS, profile 320/390/1280 PASS, composer 320/390/1280 PASS, heichelos 1280 PASS, heichelos 320/390 FAIL = rendered nginx 504 page (server saturation). Totals: 10 passed, 2 failed.
- Focused heichelos probe (same measure/check code): rounds 1-3 = 504 at load ~22; final run at load ~12: real page title rendered, PASS 320, PASS 390 -> HEICHELOS-MOBILE-VERIFIED.
- series-player playlist contract: 4/4 PASS. discoverySearch pagination: 4/4 PASS.
- library-search.cjs standalone re-run failed only with Chrome timeout at Target.createTarget while the regression Chrome held the machine; it PASSed inside both gate runs.
- Alias route curl matrix: bare 200, query 200, path 301->200 followed, path-slash 301, index.html direct 200, /@coby 200, /profile/ 200.
- Full gate --live at default timeout: non-live suites PASS, live stage died at heichelos Page.navigate (12s) under load 18 — superseded by the 90s-timeout runs above.

## Run 3 test evidence (2026-11-25)
- Playlist contract: 7/7 PASS (was 4; +visualizer passthrough, +nextOnEnded matrix, +shuffledOrder).
- Composer suites (schemaParity, aliasMemory, publicationPlan, quickDestination, quickRefinement, ComposerWorkflow, ComposerNavigationSafety): 14/14 PASS. quickDestinationFlow PASS. quickBrowserJourney FAIL at fixture-server startup ("Local Geelooy fixture server did not become ready", games harness, load 10+) — environment, before any composer code ran.
- Headless player regression on live /heichelos/ohrHaNiggun/series/echoesOfTheInfinite/: launcher visible, panel opens, Almighty Master AUDIO readyState 4, duration 99.52s, position 1/1, prefs UI present (autoplay checked, repeat off, shuffle off). paused=true under headless autoplay policy; native controls available. fx host absent — correct: that post asset carries no stored visualizer preset.
- Full gate social-css-check.sh: EXIT 1 at profileRepairContract — SAME stale assertion also fails profileActionDrawerContract: both expect a literal /profile/styles/profile-dream.css link, broken by concurrent commit 64436a22e (CompactCSS bundling of profile pages; that session has profileRepairContract.test.mjs dirty in-tree mid-fix). All other gate sections run individually: canonical 3/3, workflow 9/9, profileCardHierarchy PASS, profileSocialUxV4 PASS, isolation PASS, library-search PASS, audio-playback PASS, tunnel ingress 4/4, richSocial 6/6 incl visualizerRoundTrip PASS.
- Live computed-style probes + screenshots: see 08 / v2 screenshot set.
