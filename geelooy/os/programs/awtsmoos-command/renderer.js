// B"H
export function renderCommand({ root, history, onSubmit, complete }) {
  root.innerHTML = `<div class="awts-command-output" aria-live="polite"></div><form class="awts-command-form"><span class="awts-command-prompt">$</span><input aria-label="Awtsmoos command" autocomplete="off" spellcheck="false" /></form>`;
  const output = root.querySelector('.awts-command-output'); const form = root.querySelector('form'); const input = root.querySelector('input'); let cursor = history.commands().length;
  form.addEventListener('submit', e => { e.preventDefault(); const value = input.value; input.value = ''; cursor = history.commands().length + 1; onSubmit(value); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { e.preventDefault(); input.value = recall(--cursor); }
    if (e.key === 'ArrowDown') { e.preventDefault(); input.value = recall(++cursor); }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); history.clear(); draw(); }
    if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); history.push('^C'); input.value = ''; draw(); }
    if (e.key === 'Tab') { e.preventDefault(); const got = complete?.(input.value); if (got) input.value = input.value.replace(/\S*$/, got); }
  });
  function recall(index) { const list = history.commands(); cursor = Math.max(0, Math.min(index, list.length)); return list[cursor] || ''; }
  function draw() { output.innerHTML = history.lines().map(ansi).join('\n'); output.scrollTop = output.scrollHeight; }
  draw(); setTimeout(() => input.focus(), 0);
  return { draw, focus:() => input.focus() };
}
function ansi(line) { return escapeHtml(line).replace(/&lt;(error|info|success|muted)&gt;([\s\S]*)&lt;\/\1&gt;/g, '<span class="cmd-$1">$2</span>'); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
export const commandCss = `.awts-command{height:100%;display:flex;flex-direction:column;background:#000;color:#c0ffc0;font:13px "Lucida Console",Consolas,monospace}.awts-command-output{flex:1;white-space:pre-wrap;overflow:auto;padding:10px;background:#000;border:2px inset #d4d0c8}.awts-command-form{display:flex;gap:6px;align-items:center;padding:6px;background:#ece9d8;border-top:1px solid #fff;color:#000}.awts-command-prompt{font-weight:bold}.awts-command input{flex:1;background:#000;color:#c0ffc0;border:1px solid #808080;padding:5px;font:inherit}.cmd-error{color:#ff8a8a}.cmd-success{color:#8aff8a}.cmd-muted{color:#aaa}.cmd-info{color:#c0ffc0}`;
/** B"H: XP console chrome wraps a black firmament where green letters march. */
