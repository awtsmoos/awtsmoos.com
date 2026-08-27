// B"H
/**
 * @module LivingEntityView
 * @description
 * Chapter 8: The first bridge awakens. No legacy door is sealed, no migration
 * sword is drawn. The Awtsmoos gathers post, sections, comments, graph, DNA,
 * and reader roads into one read-only constellation so the civilization can see
 * itself before it dares to change itself.
 */

const { er } = require('../general.js');
const { getTree } = require('../comments/richCommentStore.js');
const { read, safeCall, warning } = require('./read.js');
const { postPath, sectionsPath, readerUrl } = require('./paths.js');
const { identityFromPost } = require('./identity.js');
const { contentFromPost } = require('./content.js');
const { socialFromTrees } = require('./social.js');
const { graphFromIdentity } = require('./graph.js');

async function readPostInputs({ $i, heichelId, postId }) {
  const [post, storedSections] = await Promise.all([
    read($i, postPath({ heichelId, postId }), null),
    read($i, sectionsPath({ heichelId, postId }), {})
  ]);
  return { post, storedSections };
}

async function readRichTree({ $i, heichelId, postId, verseSection = '', subsectionId = '' }) {
  const got = await safeCall(() => getTree({ $i, heichelId, postId, verseSection, subsectionId }), { success: [] });
  return got.success || [];
}

function navigationFrom({ identity, content }) {
  return {
    parent: identity.seriesId ? { type: 'series', id: identity.seriesId, heichelId: identity.heichelId } : null,
    children: content.sections.map(section => ({ type: section.type, id: section.id, verseSection: section.verseSection })),
    seriesPath: `/heichelos/${encodeURIComponent(identity.heichelId)}/series/${encodeURIComponent(identity.seriesId)}`,
    heichelPath: `/heichelos/${encodeURIComponent(identity.heichelId)}`,
    readerUrl: readerUrl(identity)
  };
}

function preservation({ post, warnings }) {
  return {
    readOnly: true,
    sourceSystems: ['legacyPostPath', 'storedSections', 'richCommentTree', 'socialGraph', 'entityUniverseDna'],
    missingSystems: post ? [] : ['legacyPostPath'],
    warnings
  };
}

async function livingPostView({ $i, heichelId, seriesId = 'root', postId, type = '' }) {
  const warnings = [];
  if (!heichelId || !postId) return er({ code: 'MISSING_PARAMS', message: 'heichelId and postId are required.' });
  const { post, storedSections } = await readPostInputs({ $i, heichelId, postId });
  if (!post) return er({ code: 'POST_NOT_FOUND', message: 'Post was not found at the legacy path.' });
  const identity = identityFromPost({ post, heichelId, seriesId, postId, type });
  const content = contentFromPost({ post, storedSections });
  const [richTree, graph] = await Promise.all([
    readRichTree({ $i, heichelId, postId }),
    graphFromIdentity({ $i, identity })
  ]);
  if (!content.sections.length) warnings.push(warning('NO_SECTIONS', 'No structured sections were found; using root content only.'));
  return { success: { identity, content, social: socialFromTrees({ richTree }), graph, navigation: navigationFrom({ identity, content }), preservation: preservation({ post, warnings }) } };
}

module.exports = { livingPostView, readPostInputs, readRichTree, navigationFrom, preservation };
