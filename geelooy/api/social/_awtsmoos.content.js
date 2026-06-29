//B"H
/**
 * Public content routes now default to community review. Creation remains direct
 * for moderators or when the Heichel disables approval, but ordinary accounts
 * submit into the pending queue where the Awtsmoos waits to be revealed.
 */
const { createPost, createQuestion, createAnswer, listAnswers, createSection, listSections, createRepost } = require('./helper/socialContent.js');
const { getCommunitySettings } = require('./helper/community/communitySettings.js');
const { createReview } = require('./helper/community/reviewEngine.js');
const { verifyHeichelAuthority } = require('./helper/heichel.js');
const { er } = require('./helper/general.js');
function needs(method, expected) { return method === expected ? null : er({ code: 'BAD_METHOD', message: `Use ${expected}.` }); }
function body($i) { return { ...($i.$_GET || {}), ...($i.$_POST || {}) }; }
function alias($i) { return body($i).aliasId; }
function answerSeries($i) { const b = body($i); return b.seriesId || b.series || 'root'; }
function validateSections($i) {
  const raw = body($i).sections || body($i).verses;
  if (raw === undefined || raw === null || raw === '' || Array.isArray(raw)) return null;
  try { return Array.isArray(JSON.parse(raw)) ? null : er({ code: 'BAD_SECTIONS', message: 'sections must be a JSON array.' }); }
  catch (error) { return er({ code: 'BAD_SECTIONS_JSON', message: 'sections must be valid JSON.', details: String(error.message || error) }); }
}
async function submitOrCreate({ $i, heichelId, contentType, create, extra = {} }) {
  const settings = await getCommunitySettings({ $i, heichelId });
  const moderator = await verifyHeichelAuthority({ $i, heichelId, aliasId: alias($i) });
  if (!settings.requireModeratorApproval || moderator) return create();
  return createReview({ $i, heichelId, aliasId: alias($i), contentType, payload: { ...($i.$_POST || {}), ...extra, contentType }, verifyHeichelAuthority });
}
module.exports = ({ $i } = {}) => ({
  '/content/heichelos/:heichel/posts': async v => {
    const bad = needs($i.request.method, 'POST') || validateSections($i); if (bad) return bad;
    return submitOrCreate({ $i, heichelId: v.heichel, contentType: 'post', create: () => createPost({ $i, heichelId: v.heichel }) });
  },
  '/content/heichelos/:heichel/questions': async v => {
    const bad = needs($i.request.method, 'POST') || validateSections($i); if (bad) return bad;
    return submitOrCreate({ $i, heichelId: v.heichel, contentType: 'question', create: () => createQuestion({ $i, heichelId: v.heichel }) });
  },
  '/content/heichelos/:heichel/questions/:question/answers': async v => {
    if ($i.request.method === 'GET') return listAnswers({ $i, heichelId: v.heichel, questionId: v.question, seriesId: answerSeries($i) });
    if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
    const bad = validateSections($i); if (bad) return bad;
    return submitOrCreate({ $i, heichelId: v.heichel, contentType: 'answer', extra: { questionId: v.question }, create: () => createAnswer({ $i, heichelId: v.heichel, questionId: v.question }) });
  },
  '/content/heichelos/:heichel/posts/:post/sections': async v => {
    if ($i.request.method === 'GET') return listSections({ $i, heichelId: v.heichel, postId: v.post });
    if ($i.request.method === 'POST') return createSection({ $i, heichelId: v.heichel, postId: v.post });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/content/repost': async () => { const bad = needs($i.request.method, 'POST'); return bad || createRepost({ $i }); },
  '/content/share': async () => { const bad = needs($i.request.method, 'POST'); if (bad) return bad; $i.$_POST.kind = $i.$_POST.kind || 'crossLinks'; return createRepost({ $i }); }
});
