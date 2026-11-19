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

function enabled(id) {
	return process.env[`AWTSMOOS_IMPORTED_COMMENTS_${id.toUpperCase()}`] !== 'false';
}

function familyFor(seriesId = '') {
	let family = null;
	if (TALMUD.test(seriesId)) family = { id: 'talmudBavli', type: 'shard', aliases: ['rashi', 'tosafos'] };
	else if (TANACH.has(seriesId)) family = { id: 'tanach', type: 'shard', aliases: TANACH_ALIASES };
	else if (/^seferHaSichos\d+$/i.test(seriesId)) family = { id: 'seferHaSichos', type: 'corpus', alias: 'sefer_hasichos_translation_en', file: 'social.heichel.ikar.comments.corpus.seferHaSichos.alias.sefer_hasichos_translation_en.v2.fs.awtsdb' };
	else if (/^likkuteiSichosVolume\d+$/i.test(seriesId)) family = { id: 'likkuteiSichos', type: 'corpus', alias: 'likkutei_translation_en', file: 'social.heichel.ikar.comments.corpus.likkuteiSichos.alias.likkutei_translation_en.v2.fs.awtsdb' };
	else if (/^seferHaMaamarim5666$/i.test(seriesId)) family = { id: 'seferHaMaamarim5666', type: 'corpus', alias: 'sefer_hamaamarim5666_translation_en', file: 'social.heichel.ikar.comments.corpus.seferHaMaamarim5666.alias.sefer_hamaamarim5666_translation_en.v2.fs.awtsdb' };
	else if (/^ayinBeisVolume3$/i.test(seriesId)) family = { id: 'ayinBeisVolume3', type: 'corpus', alias: 'ayin_beis_volume3_translation_en', file: 'social.heichel.ikar.comments.corpus.ayinBeisVolume3.alias.ayin_beis_volume3_translation_en.v2.fs.awtsdb' };
	else if (/^maamreiMittlerRebbe/i.test(seriesId)) family = { id: 'maamreiMittlerRebbe', type: 'corpus', alias: 'mittler_rebbe_translation_en', file: 'social.heichel.ikar.comments.corpus.maamreiMittlerRebbe.alias.mittler_rebbe_translation_en.v2.fs.awtsdb' };
	else if (/^BH-derechMitzvosecha-/i.test(seriesId)) family = { id: 'derechMitzvosecha', type: 'corpus', alias: 'derech_mitzvosecha_translation_en', file: 'social.heichel.ikar.comments.corpus.derechMitzvosecha.alias.derech_mitzvosecha_translation_en.v2.fs.awtsdb' };
	else if (/^yerushalmi/i.test(seriesId)) family = { id: 'talmudYerushalmi', type: 'corpus', alias: 'yerushalmi_translation_en', file: 'social.heichel.ikar.comments.corpus.talmudYerushalmi.alias.yerushalmi_translation_en.v2.fs.awtsdb' };
	else if (/^BH-mishnah-פרקי-/i.test(seriesId)) family = { id: 'rashiAvot', type: 'corpus', alias: 'rashi', file: 'social.heichel.ikar.comments.corpus.rashiAvot.alias.rashi.v2.fs.awtsdb' };
	else if (/^bavli/i.test(seriesId)) family = { id: 'talmudBavli', type: 'corpus', alias: 'bavli_translation_en', file: 'social.heichel.ikar.comments.corpus.talmudBavli.alias.bavli_translation_en.v2.fs.awtsdb', extraAliases: [{ alias: 'rashi', file: 'social.heichel.ikar.comments.corpus.talmudBavli.alias.rashi.v2.fs.awtsdb' }] };
	else if (/^(midrash-|sefer-hayashar|aggadat-bereishit|yalkut-hamechiri|alfa-beta-|haggadah-divrei-chazal|beit-hamidrash|midrashim-ketanim)/i.test(seriesId)) family = { id: 'midrashim', type: 'corpus', alias: 'midrashim_translation_en', file: 'social.heichel.ikar.comments.corpus.midrashim.alias.midrashim_translation_en.v2.fs.awtsdb' };
	else if (/^sichosKodesh\d+$/i.test(seriesId)) family = { id: 'sichosKodesh', type: 'bundle', alias: 'sichos_kodesh_translation_en', bundle: 'sichosKodesh' };
	else if (/meluket/i.test(seriesId)) family = { id: 'meluket', type: 'bundle', alias: 'meluket_translation_en', bundle: 'meluket' };
	return family && enabled(family.id) ? family : null;
}

module.exports = { familyFor, enabled };
