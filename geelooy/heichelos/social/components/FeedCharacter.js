// B"H
/** Feed-safe Chossid character avatar, inspired by the animator fallback body. */
import { h } from './render.js';
const PARTS = ['character-aura','character-shadow','character-leg left','character-leg right','character-shoe left','character-shoe right','character-robe','character-lapel left','character-lapel right','character-belt','character-arm left','character-arm right','character-hand left','character-hand right','character-neck','character-head','character-ear left','character-ear right','character-hair','character-peyos left','character-peyos right','character-hat-brim','character-hat-crown','character-eye left','character-eye right','character-brow left','character-brow right','character-nose','character-moustache','character-beard','character-smile'];
export function FeedCharacter({ name = 'Geelooy User', seed = '' } = {}) {
  return h('span', { class:`geelooy-avatar geelooy-feed-avatar geelooy-character-avatar ${variant(seed)}`, 'aria-label':name, title:name }, PARTS.map(part));
}
function part(className) { return h('i', { class:className, 'aria-hidden':'true' }); }
function variant(seed) { return `character-variant-${Math.abs(hash(seed)) % 6}`; }
function hash(text) { return [...String(text)].reduce((a, ch) => ((a << 5) - a + ch.charCodeAt(0)) | 0, 0); }
