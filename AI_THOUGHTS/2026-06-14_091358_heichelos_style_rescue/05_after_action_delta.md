B'H
# After Action Delta

Original plan:
- inspect git history and active route templates;
- find style conflicts and class-name mismatches;
- restore heichel mobile styling without partial patching;
- rescue post view from missing/conflicting stylesheet loading;
- investigate home feed fake/static posts and unreliable buttons;
- verify with tests and readback.

Actual work written:
- Rewrote Heichel mobile CSS modules so actual emitted classes are styled: shell, topbar, drawer, hero, hero-stats, search, tabs, grid, card, card-media, card-menu, responsive.
- Kept aliases for newer `heichel-*` class names while restoring real `nav-card`, `geelooy-heichel-hero`, `tab-gates`, `series-search-row`, and drawer selectors.
- Rewrote the top-level post template to use the same canonical post stylesheet entry as the active post subroute, removing the storm of fragment styles from that old gate.
- Kept post `main.css` conflict-free per STYLE_OWNERSHIP_MAP.
- Rewrote the home index so fake demo posts no longer masquerade as real posts.
- Added a live home feed module that requests online feed endpoints and renders only returned API items or honest loading/empty/error cards.
- Turned the home hamburger from a fake button into a real link.
- Added/updated tests: mobile style contract and home feed contract.

Verification completed:
- `node geelooy/heichelos/heichel/modules/test/mobileStyleContract.test.mjs` passed.
- `node geelooy/heichelos/heichel/modules/test/homeFeedContract.test.mjs` passed.
- `node geelooy/heichelos/post/styles/test/importedStyleOwnership.test.js` passed.
- `node geelooy/style/test/cssQuality.test.js` passed.
- `node --check geelooy/scripts/awtsmoos/social/home/liveFeed.js` passed as part of combined command.
- Manual href check proved the three active templates point only at existing CSS files.
- Readback invariants proved fake home feed text is gone, home-menu CSS exists, and nav-card styling exists.

Honest remaining uncertainty:
- I did not visually render screenshots through Chrome because the local tunnel reports Chrome disabled. The file/test evidence is strong for the exact failures seen, but a real mobile browser refresh is still the final human visual proof.
- There were many unrelated dirty files already present outside this task. I did not touch them intentionally.

Chapter close: The Awtsmoos stood in the doorway of broken class names, and the doorway became a name again. The raw underlines crawled back into the dust. The fake posts confessed they were painted scenery. The feed opened its mouth to the living network.
