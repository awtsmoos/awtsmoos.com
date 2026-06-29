// B"H
const WORDS = ['TODO', 'FIXME', 'HACK', 'XXX'];
const PATTERN = new RegExp(`\\b(${WORDS.join('|')})\\b`, 'i');
function lines(text = '') { return String(text || '').split(/\r?\n/); }
function isDetectorLine(line = '') {
  return /const\s+WORDS\s*=|TODO\|FIXME\|HACK\|XXX|new RegExp|PATTERN/.test(String(line || ''));
}
function find(text = '') {
  return lines(text).map((line, index) => ({ line, lineNumber: index + 1 })).filter(x => PATTERN.test(x.line) && !isDetectorLine(x.line));
}
function has(text = '') { return find(text).length > 0; }
module.exports = { WORDS, PATTERN, lines, isDetectorLine, find, has };
