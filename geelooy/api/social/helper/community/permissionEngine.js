//B"H
/**
 * Permission is not scattered if-statements anymore. It is a single lamp:
 * submitters, viewers, moderators, admins all pass through one measured flame.
 */
const { getCommunitySettings } = require('./communitySettings.js');
const { gateForType } = require('./settingsDefaults.js');
async function role({ $i, heichelId, aliasId, verifyHeichelAuthority }) {
  if (!aliasId) return { guest: true, moderator: false };
  const moderator = verifyHeichelAuthority ? !!(await verifyHeichelAuthority({ $i, heichelId, aliasId })) : false;
  return { guest: false, moderator };
}
async function canSubmit(ctx) {
  const settings = await getCommunitySettings(ctx);
  const kind = ctx.contentType || 'content';
  const r = await role(ctx);
  if (r.guest && !settings.allowAnonymous) return false;
  if (!settings.allowPublicSubmissions && !r.moderator) return false;
  return settings[gateForType(kind)] !== false;
}
async function canView(ctx) {
  const settings = await getCommunitySettings(ctx);
  const r = await role(ctx);
  return settings.allowGuestViewing || !r.guest || r.moderator;
}
async function canModerate(ctx) { return (await role(ctx)).moderator; }
async function canApprove(ctx) { return canModerate(ctx); }
async function canReject(ctx) { return canModerate(ctx); }
async function canConfigure(ctx) { return canModerate(ctx); }
async function canComment(ctx) { return canSubmit({ ...ctx, contentType: 'comment' }); }
async function canPublish(ctx) { return canApprove(ctx); }
async function canEdit(ctx) { const r = await role(ctx); return r.moderator || ctx.authorAliasId === ctx.aliasId; }
async function canDelete(ctx) { return canEdit(ctx); }
async function canInvite(ctx) { return canModerate(ctx); }
module.exports = { canSubmit, canApprove, canReject, canComment, canDelete, canEdit, canModerate, canPublish, canView, canInvite, canConfigure };
