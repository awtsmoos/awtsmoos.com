//B"H
/**
 * Community publishing routes. The Heichel opens to every account by default,
 * but every public spark waits in review until a keeper reveals it as published.
 */
const { getCommunitySettings, updateCommunitySettings } = require('./helper/community/communitySettings.js');
const review = require('./helper/community/reviewEngine.js');
const { verifyHeichelAuthority } = require('./helper/heichel.js');
const { createPost, createQuestion, createAnswer } = require('./helper/socialContent.js');
const { er } = require('./helper/general.js');
function body($i) { return $i.$_POST || $i.$_PUT || $i.$_DELETE || {}; }
function query($i) { return $i.$_GET || {}; }
function alias($i) { return body($i).aliasId || query($i).aliasId; }
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
    if ($i.request.method === 'GET') return { success: await getCommunitySettings({ $i, heichelId: v.heichel }) };
    if (!['POST', 'PUT'].includes($i.request.method)) return er({ code: 'BAD_METHOD' });
    if (!(await verifyHeichelAuthority({ $i, heichelId: v.heichel, aliasId: alias($i) }))) return er({ code: 'NO_AUTH' });
    return updateCommunitySettings({ $i, heichelId: v.heichel, patch: body($i) });
  },
  '/heichelos/:heichel/review': async v => {
    if ($i.request.method === 'GET') return review.listReview({ $i, heichelId: v.heichel, status: query($i).status || 'pending', contentType: query($i).type, search: query($i).search || '', limit: query($i).limit || 50, offset: query($i).offset || 0 });
    if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD' });
    return review.createReview({ $i, heichelId: v.heichel, aliasId: alias($i), contentType: body($i).contentType || body($i).type || 'content', payload: body($i), verifyHeichelAuthority });
  },
  '/heichelos/:heichel/moderation': async v => review.listReview({ $i, heichelId: v.heichel, status: query($i).status || 'pending', contentType: query($i).type, search: query($i).search || '', limit: query($i).limit || 50, offset: query($i).offset || 0 }),
  '/heichelos/:heichel/review/:review/approve': async v => {
    if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD' });
    const approved = await review.approveReview({ $i, heichelId: v.heichel, reviewId: v.review, aliasId: alias($i), note: body($i).note || '', verifyHeichelAuthority });
    if (!approved.success || body($i).publish === false || body($i).publish === 'false') return approved;
    const published = await publishApproved({ $i, record: approved.success });
    return { success: { approved: approved.success, published: published.success || published } };
  },
  '/heichelos/:heichel/review/:review/reject': async v => {
    if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD' });
    return review.rejectReview({ $i, heichelId: v.heichel, reviewId: v.review, aliasId: alias($i), note: body($i).note || '', verifyHeichelAuthority });
  }
});
