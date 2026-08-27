// B"H
function text(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(' ');
  if (typeof value === 'object') return [text(value.title), text(value.text || value.content || value.body)].filter(Boolean).join('\n');
  return String(value);
}
function normalized(value) {
  return text(value).replace(/<[^>]+>/g, ' ').replace(/[\u0591-\u05c7]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();
}
function overlap(source, target) {
  const a = new Set(normalized(source).split(/\s+/).filter(x => x.length > 1));
  const b = new Set(normalized(target).split(/\s+/).filter(Boolean));
  if (!a.size) return null;
  let matched = 0;
  for (const token of a) if (b.has(token)) matched++;
  return matched / a.size;
}
module.exports = { text, normalized, overlap };
