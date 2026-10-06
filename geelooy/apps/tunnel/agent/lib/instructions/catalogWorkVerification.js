// B"H
// Boruch Hashem
// Blessed is He
const {instructionPack}=require("./pack.js");
/** The Awtsmoos keeps continuation, evidence and bounded recovery tied to real work. */
const workVerificationInstructions=Object.freeze([instructionPack({
 id:"work.durable-verification",version:1,summary:"Use durable work sessions, real browser evidence and commit-bound release gates.",
 tags:["work","continuation","verification","stability","deploy"],
 applies:{taskHints:["continue","frontend","css","fix","deploy","release","stability"]},
 instructions:[
  "Begin with tunnelWorkBegin: task, all affected paths, remainingWork and nextAction; for frontend include frontend:true and every affected page URL.",
  "Read every returned instruction body. Acknowledge its exact hash through tunnelWorkCheckpoint with instructionHash and the current revision. Never acknowledge unread bodies.",
  "Checkpoint completed, remainingWork, nextAction, failures and reportIds after each bounded useful step. Durable state lives outside replaceable source files.",
  "After interruption use tunnelWorkResume, inspect actual Git state, and call tunnelWorkRefresh before edits when commit, instructions or scope changed. Checkpoint mutations use optimistic revisions; reread after a conflict.",
  "For frontend use chromeVerifyFrontend with url, widths:[390,768,1440] and explicit interaction steps plus styleAssertions (selector, property, equals) for critical computed CSS values. It saves screenshots and a real Chrome report; node-dom and HTTP status are not rendered proof.",
  "Browser verification checks the running release at releaseUrl (default /api/release/) against the tested commit. For static previews, provide assetContracts mapping served URLs to committed CSS/JS/HTML paths. Old live assets are not evidence of new local source.",
  "Inspect saved screenshots for overlap and readability. Exercise the real affected feature. Automated geometry and asset checks do not prove visual polish or feature semantics.",
  "Use tunnelWorkReview with reportId, actual screenshot observations in reviewNotes, and reviewedScreenshotHashes after looking at every screenshot. Automated checks alone cannot pass the visual-review gate.",
  "Attach returned reportId to the work session. Report IDs are loaded from durable storage by tunnelWorkGate; client assertions cannot manufacture browser reports.",
  "Finish work, commit the tested source and refresh instructions; then rerun browser verification against that commit. Dirty or changed commits invalidate release evidence.",
  "tunnelWorkGate requires acknowledged current instructions, no remaining work or next action, and recent real browser evidence at mobile and desktop widths with verified interactions for every frontend URL.",
  "Export tunnelWorkReleaseReceipt after the gate passes, transfer its JSON to production outside Git, and set AWTSMOOS_FRONTEND_RELEASE_RECEIPT to that file when deploying frontend commits. Canonical deployment checks the exact target commit and refuses missing or stale evidence.",
  "Use tunnelWorkHealth to see distinct check categories. Command, file integrity, authenticated client, and rendered frontend remain unverified until separately exercised; never inherit success from relay readiness.",
  "Keep process liveness, registered relay, command execution, file integrity, authenticated client access and rendered page behavior as separate timestamped checks. Unperformed checks stay unverified.",
  "Retry only safe reads with bounded attempts. Reconcile durable jobs before repeating interrupted mutations. Maintain deadlines and cancellation; do not loop indefinitely.",
  "Use isolated Git worktrees for simultaneous agents. Preserve unrelated changes. Emit concrete user progress at least once per minute."
 ]})]);
module.exports={workVerificationInstructions};
