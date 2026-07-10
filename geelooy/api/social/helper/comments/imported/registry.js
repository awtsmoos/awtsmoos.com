// B"H
const TANACH = new Set([
  'bereishis','bereshis','shemos','vayikra','bamidbar','devarim','yehoshua','shoftim',
  'shmuelAleph','shmuelBeis','melachimAleph','melachimBeis','yeshayahu','yirmiyahu',
  'yechezkel','hoshea','yoel','amos','ovadia','ovadiah','yonah','michah','nachum',
  'chavakuk','tzefania','tzefaniah','chagai','chaggai','zecharia','zechariah','malachi',
  'tehillim','mishlei','iyov','shirHashirim','shir_hashirim','rus','eicha','eichah',
  'koheles','esther','ester','daniel','ezra','nechemia','nechemiah',
  'divreiHayamimAleph','divreiHayamimBeis','divrei_hayamim'
]);
const TALMUD = /^(berakhot|shabbat|eiruvin|pesachim|yoma|sukkah|beitzah|rosh_hashanah|taanit|megillah|moed_katan|chagigah|yevamot|ketubot|nedarim|nazir|sotah|gittin|kiddushin|bava_|sanhedrin|makkot|shevuot|avodah_zarah|horayot|zevachim|menachot|chullin|bekhorot|arakhin|temurah|keritot|meilah|tamid|middot|niddah)/;
const TANACH_ALIASES = ['rashi','rashbam','ramban','ibnEzra','sforno','onkeles','baalHaturim','ohrHachayim','torah_translation_en','awtsmoos'];
function enabled(id) { return process.env[`AWTSMOOS_IMPORTED_COMMENTS_${id.toUpperCase()}`] !== 'false'; }
function familyFor(seriesId = '') {
  let family = null;
  if (TALMUD.test(seriesId)) family = { id: 'talmudBavli', type: 'shard', aliases: ['rashi', 'tosafos'] };
  else if (TANACH.has(seriesId)) family = { id: 'tanach', type: 'shard', aliases: TANACH_ALIASES };
  else if (/^seferHaSichos\d+$/i.test(seriesId)) family = { id: 'seferHaSichos', type: 'corpus', alias: 'sefer_hasichos_translation_en', file: 'social.heichel.ikar.comments.corpus.seferHaSichos.alias.sefer_hasichos_translation_en.v2.fs.awtsdb' };
  else if (/^likkuteiSichosVolume\d+$/i.test(seriesId)) family = { id: 'likkuteiSichos', type: 'corpus', alias: 'likkutei_translation_en', file: 'social.heichel.ikar.comments.corpus.likkuteiSichos.alias.likkutei_translation_en.v2.fs.awtsdb' };
  else if (/meluket/i.test(seriesId)) family = { id: 'meluket', type: 'legacy' };
  return family && enabled(family.id) ? family : null;
}
module.exports = { familyFor, enabled };
