<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Awtsmoos installed stability and work verification
Production and the Mac were upgraded to runtime 1.0.645. The public /api/release/ endpoint confirmed running source commit 575cfecf629662fc99f93311f03779e4dd26fb52.
Final installed probes passed: 12 concurrent owned commands with exact stdout, exact file write/readback, eight concurrent server instruction resolutions, five new action schemas, durable checkpoint revision 2, and fresh instruction-aware resume.
Real installed Chrome verification passed at 390, 768 and 1440 pixels with click/assert-visible and computed CSS checks. Deliberately missing CSS and a stale release were rejected; committed CSS bytes matched served asset hashes.
The work release gate correctly refused repository_dirty in the shared Mac checkout. No unrelated agent changes were discarded.
Focused final suite: 11 tests passed. Canonical activation/protocol/rollback fixture passed. Prior broader instruction/browser queue suite: 17 tests passed.
An initial installed test exposed worker isolation losing the instruction broker. Work actions now stay beside the authenticated parent bridge; regression and installed probes passed after that correction.
Limits: browser checks above use an owned fixture, not every website page. User-authenticated ChatGPT MCP access remains unverified in this session. Durable continuation does not mean indefinite unattended ChatGPT execution. The initial promotion lost readiness during startup; final 1.0.645 candidate/promotion and installed probes passed.
See ../../workVerificationGuide.md for the required workflow and frontend release receipt procedure.
