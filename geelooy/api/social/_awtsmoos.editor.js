// B"H
/**
 * @module SocialEditorRoutes
 * @description
 * Chapter 156: Structured entity editor routes for drafts, publishing, and
 * cautious verse/subsection deletion with preview + confirmation.
 */

const { er } = require('./helper/general.js');
const { saveDraft, readDraft, publishDraft } = require('./helper/editor/postDrafts.js');
const { deleteVerseFromPost, deleteSubsectionFromPost, previewVerseFromPost, previewSubsectionFromPost } = require('./helper/editor/postStructureDeletion.js');

function needs($i, method) {
  return $i.request.method === method ? null : er({ code: 'BAD_METHOD', message: `Use ${method}.` });
}

module.exports = ({ $i } = {}) => ({
  '/editor/posts/drafts': async () => {
    const bad = needs($i, 'POST');
    if (bad) return bad;
    return await saveDraft({ $i });
  },

  '/editor/posts/drafts/:alias/:draft': async vars => {
    const bad = needs($i, 'GET');
    if (bad) return bad;
    return await readDraft({ $i, aliasId: vars.alias, draftId: vars.draft });
  },

  '/editor/posts/drafts/publish': async () => {
    const bad = needs($i, 'POST');
    if (bad) return bad;
    return await publishDraft({ $i });
  },

  '/editor/heichelos/:heichel/posts/:post/verses/:verse/delete-preview': async vars => {
    const bad = needs($i, 'GET');
    if (bad) return bad;
    return await previewVerseFromPost({ $i, heichelId: vars.heichel, postId: vars.post, verseId: vars.verse });
  },

  '/editor/heichelos/:heichel/posts/:post/verses/:verse': async vars => {
    const bad = needs($i, 'DELETE');
    if (bad) return bad;
    return await deleteVerseFromPost({ $i, heichelId: vars.heichel, postId: vars.post, verseId: vars.verse });
  },

  '/editor/heichelos/:heichel/posts/:post/subsections/:subsection/delete-preview': async vars => {
    const bad = needs($i, 'GET');
    if (bad) return bad;
    return await previewSubsectionFromPost({ $i, heichelId: vars.heichel, postId: vars.post, subsectionId: vars.subsection });
  },

  '/editor/heichelos/:heichel/posts/:post/subsections/:subsection': async vars => {
    const bad = needs($i, 'DELETE');
    if (bad) return bad;
    return await deleteSubsectionFromPost({ $i, heichelId: vars.heichel, postId: vars.post, subsectionId: vars.subsection });
  }
});
