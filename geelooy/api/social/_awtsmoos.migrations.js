//B"H
/**
 * Social migration routes. These are safe-first: dry-run, then explicit run.
 */

const {
  dryRunPostMigration,
  runPostMigration
} = require('./helper/packed/postMigration.js');
const { er } = require('./helper/general.js');

module.exports = ({ $i } = {}) => ({
  "/migrations/posts/v2/dryRun": async () => {
    if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
    return { success: await dryRunPostMigration({
      $i,
      heichelId: $i.$_GET.heichelId,
      seriesId: $i.$_GET.seriesId || 'root'
    }) };
  },

  "/migrations/posts/v2/run": async () => {
    if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
    return { success: await runPostMigration({
      $i,
      heichelId: $i.$_POST.heichelId,
      seriesId: $i.$_POST.seriesId || 'root',
      limit: Number($i.$_POST.limit || 100)
    }) };
  }
});
