//B"H
/**
 * @module translationHash
 * @description Hashes bind Hebrew, native English, and policy into one seal.
 */
import crypto from 'node:crypto';
import { DIVINE_NAME_POLICY, PROMPT_VERSION } from './config.mjs';

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function sourceHash(unit) {
  return sha256(JSON.stringify({
    book: unit.book,
    chapter: unit.chapter,
    verseSection: unit.verseSection,
    hebrew: unit.hebrew,
    nativeEnglish: unit.nativeEnglish || '',
    promptVersion: PROMPT_VERSION,
    policy: DIVINE_NAME_POLICY
  }));
}

export function alignmentHash(unit) {
  return sha256(JSON.stringify({
    tanachArticleIndex: unit.tanachArticleIndex,
    tanachArticleId: unit.tanachArticleId,
    tanachVerseIndex: unit.tanachVerseIndex,
    tanachVerseNumber: unit.tanachVerseNumber,
    tanachHebrew: unit.tanachHebrew,
    nativeEnglish: unit.nativeEnglish || ''
  }));
}
