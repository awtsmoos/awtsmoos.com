//B"H
/**
 * Default community gates: open by default, moderated by default, a public
 * river entering the Heichel but pausing before the Aron until reviewed.
 *
 * Chapter 244: the Awtsmoos teaches that a string saying "false" must not wear
 * the garments of truth. Every known gate is washed into a real boolean before
 * permissions decide who may enter.
 */
const COMMUNITY_DEFAULTS = Object.freeze({
  allowPublicSubmissions: true,
  requireModeratorApproval: true,
  allowAnonymous: false,
  allowGuestViewing: true,
  allowQuestions: true,
  allowAnswers: true,
  allowPosts: true,
  allowSeries: true,
  allowComments: true,
  allowPolls: false,
  commentModeration: true
});
const BOOLEAN_KEYS = Object.freeze(Object.keys(COMMUNITY_DEFAULTS));
function bool(value, fallback) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const clean = value.trim().toLowerCase();
    if (['false', '0', 'off', 'no', 'disabled'].includes(clean)) return false;
    if (['true', '1', 'on', 'yes', 'enabled'].includes(clean)) return true;
  }
  return fallback;
}
function mergeCommunitySettings(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const next = { ...source };
  for (const key of BOOLEAN_KEYS) next[key] = bool(source[key], COMMUNITY_DEFAULTS[key]);
  return next;
}
function gateForType(type) {
  return { post: 'allowPosts', question: 'allowQuestions', answer: 'allowAnswers', series: 'allowSeries', comment: 'allowComments', poll: 'allowPolls' }[type] || 'allowPublicSubmissions';
}
module.exports = { COMMUNITY_DEFAULTS, BOOLEAN_KEYS, mergeCommunitySettings, gateForType };
