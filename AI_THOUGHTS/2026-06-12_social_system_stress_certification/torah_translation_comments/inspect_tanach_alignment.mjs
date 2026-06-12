//B"H
/**
 * @module InspectTanachAlignment
 * @description Find exact article indices and verse/native English shape.
 */
import fs from 'node:fs';

const TANACH_PATH = 'C:/Users/Yackov Yitzchak/Documents/WoW/BH/torah/Tanach.json';
const root = JSON.parse(fs.readFileSync(TANACH_PATH, 'utf8'));

function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function verseInfo(articleIndex, verseIndex) {
  const article = root[articleIndex];
  const verse = article?.data?.body?.verses?.[verseIndex];
  return {
    articleIndex,
    articleId: article?.data?.body?.['article-id'],
    verseIndex,
    keys: verse ? Object.keys(verse) : [],
    hebrew: verse?.hebrew,
    native: verse?.native,
    nativeText: stripHtml(verse?.native?.text || verse?.native?.[0]?.text || ''),
    nativeTitle: stripHtml(verse?.native?.title || verse?.native?.[0]?.title || ''),
    commentatorTypes: (verse?.commentators || []).slice(0, 8).map(c => c.type)
  };
}

function articleSummary(index) {
  const article = root[index];
  const verses = article?.data?.body?.verses || [];
  return {
    index,
    articleId: article?.data?.body?.['article-id'],
    verseCount: verses.length,
    firstHebrew: verses[0]?.hebrew?.text,
    firstNative: stripHtml(verses[0]?.native?.text || verses[0]?.native?.[0]?.text || ''),
    firstNativeRaw: verses[0]?.native,
    name: article?.name
  };
}

function scoreArticle(article, needles) {
  const verses = article?.data?.body?.verses || [];
  const sample = verses.slice(0, 3).map(v => `${v?.hebrew?.text || ''} ${v?.native?.text || ''}`).join(' ');
  return needles.some(n => sample.includes(n));
}

const genesisNeedles = ['בְּרֵאשִׁ', 'In the beginning'];
const psalmNeedles = ['אַֽשְֽׁרֵ֥י', 'Praiseworthy', 'Fortunate', 'Happy is'];
const candidates = [];
for (let i = 0; i < root.length; i++) {
  if (scoreArticle(root[i], genesisNeedles)) candidates.push({ kind: 'genesis-like', ...articleSummary(i) });
  if (scoreArticle(root[i], psalmNeedles)) candidates.push({ kind: 'psalm-like', ...articleSummary(i) });
}

console.log('B"H candidates');
console.log(JSON.stringify(candidates.slice(0, 30), null, 2));
console.log('B"H Genesis first 3 verses');
console.log(JSON.stringify([0, 1, 2].map(i => verseInfo(0, i)), null, 2).slice(0, 12000));
const psalmIndex = candidates.find(c => c.kind === 'psalm-like')?.index;
console.log('B"H Psalm candidate first 3 verses');
console.log(JSON.stringify([0, 1, 2].map(i => verseInfo(psalmIndex, i)), null, 2).slice(0, 12000));
