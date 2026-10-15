# B"H — Comment Creation Pipeline (geelooy/api/social/helper/comments/creation/)

The comment-creation pipeline, decomposed in the codebase's sephirah naming style. Each file owns one responsibility in turning a submission into a stored comment record.

## Files
- `KeserCommentCreationCoordinator.js` — orchestrates the whole creation flow.
- `BinahCommentInput.js` — decodes/validates incoming comment input.
- `BinahCommentSubmissionService.js` — submission handling.
- `ChesedBulkCommentService.js` — bulk comment creation.
- `GevurahCommentAuthority.js` — permission/authority checks before writing.
- `NetzachCommentIdentity.js` — resolves the authoring identity.
- `HodAliasCommentIndex.js` — updates the alias comment index on creation.
- `TiferesCommentCreationService.js` — the core creation service.
- `MalchusCommentRecord.js` — final comment record shape written to storage.
