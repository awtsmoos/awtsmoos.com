// B"H
/**
 * @file typing.js
 * @brief Pure insertion helpers for AI Studio.
 */

export function computeInsertion(before = '', start = 0, end = start, insertion = '') {
  const source = String(before || '');
  const left = Math.max(0, Math.min(Number(start) || 0, source.length));
  const right = Math.max(left, Math.min(Number(end) || left, source.length));
  const text = String(insertion || '');
  const value = source.slice(0, left) + text + source.slice(right);
  const caret = left + text.length;
  return { value, selectionStart: caret, selectionEnd: caret };
}

export function applyInsertion(editor, insertion = '') {
  const patch = computeInsertion(editor?.value || '', editor?.selectionStart || 0, editor?.selectionEnd || editor?.selectionStart || 0, insertion);
  if (editor) {
    editor.value = patch.value;
    editor.selectionStart = patch.selectionStart;
    editor.selectionEnd = patch.selectionEnd;
  }
  return patch;
}
