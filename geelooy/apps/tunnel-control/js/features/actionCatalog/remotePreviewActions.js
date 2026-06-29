// B"H
import { action } from './action.js';

/** B"H: preview actions are windows where hidden local roots become guarded light. */
export const REMOTE_PREVIEW_ACTIONS = Object.freeze([
  action('sharePreviewFile', 'Share file preview', 'Create local scoped link plus hosted /view preview recipe.', 'Remote Preview', ['share','view'], { path:'README.md', ttlSeconds:1800 }),
  action('sharePreviewFolder', 'Share folder preview', 'Create a folder preview recipe and scoped local token.', 'Remote Preview', ['share','folder'], { path:'.', ttlSeconds:1800 }),
  action('sharePreviewServer', 'Share local server', 'Create a local server /view proxy recipe.', 'Remote Preview', ['share','proxy'], { port:3000, ttlSeconds:1800 }),
  action('sharePreviewCommandJob', 'Share command receipt', 'Create a preview recipe for command/action output.', 'Remote Preview', ['share','receipt'], { jobId:'', ttlSeconds:1800 }),
  action('previewCreate', 'Hosted preview create', 'Return/create hosted preview URL/payload.', 'Remote Preview', ['view'], { kind:'file', path:'README.md', visibility:'private' }),
  action('previewExposeLocalServer', 'Hosted server preview', 'Return hosted /view proxy recipe for a local server.', 'Remote Preview', ['view','proxy'], { port:3000, visibility:'private' }),
  action('previewList', 'List private previews', 'List active previews for the logged-in owner account.', 'Remote Preview', ['status','account'], {}),
  action('previewGrant', 'Grant preview access', 'Invite account ids/emails to an owner-only preview.', 'Remote Preview', ['share','account'], { previewId:'', access:{ userIds:[], emails:[] } }),
  action('previewAccessRevoke', 'Revoke preview access', 'Remove invited account ids/emails from a private preview.', 'Remote Preview', ['share','account'], { previewId:'', access:{ userIds:[], emails:[] } }),
  action('previewSettingsSet', 'Preview settings', 'Toggle auto-preview and public-link permissions.', 'Remote Preview', ['settings'], { settings:{ autoPreview:true, allowAiCreatePublic:false } }),
  action('shareList', 'List shares', 'List active scoped shares.', 'Remote Preview', ['status'], {}),
  action('shareRevoke', 'Revoke share', 'Revoke one share by id/token.', 'Remote Preview', ['safe'], { id:'' }),
  action('shareRevokeAll', 'Revoke all shares', 'Close every scoped share for this root.', 'Remote Preview', ['danger-safe'], {}),
  action('shareAudit', 'Share audit', 'Read scoped-share audit events.', 'Remote Preview', ['status'], { limit:100 })
]);
