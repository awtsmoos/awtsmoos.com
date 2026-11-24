# B"H — 04 Files and contracts

Created:
- geelooy/profile/package.json — {"type":"module"} + BH header fields, pattern of geelooy/shared/package.json and geelooy/social-composer/package.json.
- geelooy/profile/modules/profile-actions/settings.js (109 lines) — settingsMenu + settingsRow, exported settingsMenu.
- geelooy/profile/modules/profile-actions/settingsToggle.js (49 lines) — settingsToggle(row) with row.alias supplied by settings.js (was state.defaultAlias inside content.js; behavior identical).
- geelooy/profile/styles/profile-heichel-nav-v4.css — .geelooy-profile-shell-scoped .heichel-nav__* classes, 44px targets, depth 0-5 indent classes.
- geelooy/api/social/helper/richSocial/test/visualizerRoundTrip.test.js — asserts allowed presets survive normalizeAttachments + normalizeRichPost (root + section assets); hostile/non-audio stripped.
- /etc/logrotate.d/awtsmoos-tunnel (server config, outside repo) — agent.log + recovery.log: daily, maxsize 50M, rotate 3, compress, copytruncate.
Rewritten complete:
- geelooy/profile/modules/profile-actions/content.js 234 -> 98 lines; imports settingsMenu from ./settings.js; buildProfileAction contract unchanged.
- geelooy/profile/modules/HeichelNavigation.js — class-based, exports seriesPath/composerPath/flattenTree/heichelNavigation unchanged; lazy fetch on toggle unchanged; NO_LOGIN-safe error text preserved.
- geelooy/profile/styles/profile-cards-v4.css — +1 @import of profile-heichel-nav-v4.css (loads last).
- scripts/production/social-css-check.sh — gate adds profileActionDrawer/profileCardHierarchyV4/profileSocialUxV4 contracts, tunnel parentConsumerIngressEvidence, all 6 richSocial tests.
Edited one line (left uncommitted with its owning session's file):
- geelooy/profile/modules/cards.js — import pin HeichelNavigation.js?v=nav-001 -> ?v=nav-002. cards.js carries another session's uncommitted work; do not commit it from a different session without review.
Contracts: CanonicalPostRoute (exact series, same-origin only, published vs moderated receipts); ComposerWorkflow (ambiguous receipt retains draft+key; key conflict rotates once; clean publish rotates after success); AttachmentSchema visualizer audio-only allowlist.
