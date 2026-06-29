//B"H
/**
 * Community publishing routes. The Heichel opens to every account by default,
 * then moderators reveal the queued sparks with measured search and pages.
 */
const { getCommunitySettings, updateCommunitySettings } = require('./helper/community/communitySettings.js');
const review = require('./helper/community/reviewEngine.js');
const { verifyHeichelAuthority } = require('./helper/heichel.js');
const { createPost, createQuestion, createAnswer } = require('./helper/socialContent.js');
const { er } = require('./helper/general.js');
function body($i) { return $i.$_POST || $i.$_PUT || $i.$_DELETE || {}; }
function query($i) { return $i.$_GET || {}; }
function method($i) { return $i.request?.method || 'GET'; }
function alias($i) { return body($i).aliasId || query($i).aliasId; }
function reviewQuery($i) {
  const q = query($i);
  return { status: q.status || 'pending', contentType: q.type || q.contentType || '', search: q.search || '', limit: q.limit || 50, offset: q.offset || 0 };
}
async function publishApproved({ $i, record }) {
  const old = $i.$_POST;
  $i.$_POST = { ...(record.payload || {}), aliasId: record.aliasId || record.payload?.aliasId };
  let out;
  if (record.contentType === 'question') out = await createQuestion({ $i, heichelId: record.heichelId });
  else if (record.contentType === 'answer') out = await createAnswer({ $i, heichelId: record.heichelId, questionId: record.payload?.questionId || record.payload?.parentQuestionId });
  else if (record.contentType === 'post' || record.contentType === 'content') out = await createPost({ $i, heichelId: record.heichelId });
  else out = { success: { approvedOnly: true, contentType: record.contentType } };
  $i.$_POST = old;
  return out;
}
module.exports = ({ $i } = {}) => ({
  '/heichelos/:heichel/settings/community': async v => {
    if (method($i) === 'GET') return { success: await getCommunitySettings({ $i, heichelId: v.heichel }) };
    if (!['POST', 'PUT'].includes(method($i))) return er({ code: 'BAD_METHOD' });
    if (!(await verifyHeichelAuthority({ $i, heichelId: v.heichel, aliasId: alias($i) }))) return er({ code: 'NO_AUTH' });
    return updateCommunitySettings({ $i, heichelId: v.heichel, patch: body($i) });
  },
  '/heichelos/:heichel/review': async v => {
    if (method($i) === 'GET') return review.listReview({ $i, heichelId: v.heichel, ...reviewQuery($i) });
    if (method($i) !== 'POST') return er({ code: 'BAD_METHOD' });
    return review.createReview({ $i, heichelId: v.heichel, aliasId: alias($i), contentType: body($i).contentType || body($i).type || 'content', payload: body($i), verifyHeichelAuthority });
  },
  '/heichelos/:heichel/moderation': async v => {
    if (method($i) !== 'GET') return er({ code: 'BAD_METHOD' });
    return review.listReview({ $i, heichelId: v.heichel, ...reviewQuery($i) });
  },
  '/heichelos/:heichel/review/:review/approve': async v => {
    if (method($i) !== 'POST') return er({ code: 'BAD_METHOD' });
    const approved = await review.approveReview({ $i, heichelId: v.heichel, reviewId: v.review, aliasId: alias($i), note: body($i).note || '', verifyHeichelAuthority });
    if (!approved.success || body($i).publish === false || body($i).publish === 'false') return approved;
    const published = await publishApproved({ $i, record: approved.success });
    return { success: { approved: approved.success, published: published.success || published } };
  },
  '/heichelos/:heichel/review/:review/reject': async v => {
    if (method($i) !== 'POST') return er({ code: 'BAD_METHOD' });
    return review.rejectReview({ $i, heichelId: v.heichel, reviewId: v.review, aliasId: alias($i), note: body($i).note || '', verifyHeichelAuthority });
  }
});
