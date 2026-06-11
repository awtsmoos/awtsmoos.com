// B"H
/**
 * @module LivingEntityRoutes
 * @description
 * Chapter 9: A new gate opens beside every old gate. It does not create,
 * mutate, approve, delete, migrate, or crown itself king. It only reveals the
 * one living view of an old post so profiles, Heichelos, readers, and future
 * maps can drink from the same harmless read-only river.
 */

const { er } = require('./helper/general.js');
const { livingPostView } = require('./helper/livingEntityView/index.js');

function getOnly($i) {
  return $i.request.method === 'GET' ? null : er({ code: 'BAD_METHOD', message: 'Use GET.' });
}

module.exports = ({ $i } = {}) => ({
  '/living/heichelos/:heichel/series/:series/posts/:post': async vars => {
    const bad = getOnly($i);
    if (bad) return bad;
    return await livingPostView({
      $i,
      heichelId: vars.heichel,
      seriesId: vars.series,
      postId: vars.post,
      type: $i.$_GET.type || ''
    });
  },

  '/living/heichelos/:heichel/posts/:post': async vars => {
    const bad = getOnly($i);
    if (bad) return bad;
    return await livingPostView({
      $i,
      heichelId: vars.heichel,
      seriesId: $i.$_GET.seriesId || 'root',
      postId: vars.post,
      type: $i.$_GET.type || ''
    });
  }
});
