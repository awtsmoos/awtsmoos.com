// B"H
const path = require('path');
const repo = path.resolve(__dirname, '../..');
const data = path.resolve(repo, '../../dayuhChadash/socialPacked');
module.exports = {
  repo,
  data,
  active: path.join(data, 'social.heichel.ikar.posts.fs.awtsdb'),
  candidate: path.join(data, 'social.heichel.ikar.posts.canonical-restore.fs.awtsdb'),
  likkuteiSource: '/Users/awtsmoos/Documents/awtsmoos/docs/AI_THOUGHTS/2026-06-29_likkutei_sichos_live_db_repair/clone_tests/20260629_134642-broad-source-job-import/dayuhChadash/socialPacked/social.heichel.ikar.posts.fs.awtsdb',
  likkuteiCorpus: path.join(data, 'social.heichel.ikar.comments.corpus.likkuteiSichos.alias.likkutei_translation_en.v2.fs.awtsdb'),
  tanachJson: '/Users/awtsmoos/Documents/awtsmoos/docs/torah/Tanach.json',
  tanachShards: path.join(data, 'commentShards/tanach')
};
