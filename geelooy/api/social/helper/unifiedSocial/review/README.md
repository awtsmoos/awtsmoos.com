# B"H — Unified Social Review (geelooy/api/social/helper/unifiedSocial/review/)

Review workflow for unified social: typed submissions, legal state transitions, reviewer assignment, scheduling, publication, and notifications — with legacy governance/post adapters.

## Files
- `ReviewService.js`, `ReviewStore.js`, `ReviewRouteHandlers.js` — review service, store, routes.
- `ReviewAssignment.js`, `ReviewAccess.js`, `ReviewNotifications.js` — assignment, access, notifications.
- `SubmissionSchema.js`, `SubmissionPaths.js`, `SubmissionPublisher.js`, `SubmissionPresenter.js` — submissions.
- `LegacyPostSubmissionAdapter/Input/ReviewState/Publication`, `LegacyGovernanceSubmissionAdapter/Input/ReviewState/Publication` — legacy adapters so old records keep working.
