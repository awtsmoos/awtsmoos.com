# B"H — Unified Social Permissions (geelooy/api/social/helper/unifiedSocial/permissions/)

Acting-alias authorization for unified social: compiled capabilities, governance, roles, invitations, and route authorization — all fail-closed.

## Files
- `ActorAuthorization.js` — acting-alias authorization (adapts native `verifyAliasOwnership`).
- `PermissionCompiler.js`, `CapabilityCatalog.js`, `PolicyResolver.js` — compile effective roles into capabilities.
- `RouteAuthorization.js` — per-route authorization.
- `RoleIndexes.js`, `RoleMutationSchema.js`, `RoleMutationService.js` — role storage and hierarchy-safe mutations.
- `RoleInvitationService.js`, `RoleInvitationStore.js` — seven-day invitations with explicit consent.
- `LegacyRoleReader.js` — dual-reads legacy editors/moderators/contributors/followers.
- `MemberGovernanceHandlers.js`, `GovernanceAudit.js`, `GovernanceNotifications.js` — member governance, audit records, notifications.
