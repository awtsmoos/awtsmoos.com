// B"H
export function renderCommand({ root, history, onSubmit, complete }) {
  root.innerHTML = `<div class="awts-command-head"><b>Awtsmoos Shell</b><span>native vessel ready</span></div><div class="awts-command-output" aria-live="polite"></div><form class="awts-command-form"><span class="awts-command-prompt">$</span><input aria-label="Awtsmoos command" autocomplete="off" spellcheck="false" /></form>`;
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
  draw(); setTimeout(() => input.focus(), 0); return { draw, focus:() => input.focus() };
}
function ansi(line) { return escapeHtml(line).replace(/&lt;(error|info|success|muted)&gt;([\s\S]*)&lt;\/\1&gt;/g, '<span class="cmd-$1">$2</span>'); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
export const commandCss = `.awts-command{height:100%;min-height:0;display:flex;flex-direction:column;background:radial-gradient(circle at 20% 0,rgba(92,246,255,.13),transparent 34%),linear-gradient(180deg,#06111f,#020509);color:#c7ffdd;font:13px "SFMono-Regular","Cascadia Code","Lucida Console",Consolas,monospace}.awts-command-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border-bottom:1px solid rgba(92,246,255,.28);background:rgba(10,33,64,.72);color:#effcff;font-family:Inter,Tahoma,sans-serif}.awts-command-head span{color:#83ffd0;font-size:11px;text-transform:uppercase;letter-spacing:.12em}.awts-command-output{flex:1;min-height:0;white-space:pre-wrap;overflow:auto;padding:14px;background:rgba(0,0,0,.42);text-shadow:0 0 8px rgba(82,255,184,.22)}.awts-command-output::-webkit-scrollbar{width:12px}.awts-command-output::-webkit-scrollbar-thumb{background:rgba(92,246,255,.4);border-radius:999px}.awts-command-form{display:flex;gap:8px;align-items:center;padding:10px;background:rgba(6,17,31,.92);border-top:1px solid rgba(92,246,255,.24);color:#effcff}.awts-command-prompt{color:#52ffb8;font-weight:900}.awts-command input{flex:1;min-width:0;background:rgba(0,0,0,.72);color:#c7ffdd;border:1px solid rgba(92,246,255,.44);border-radius:12px;padding:9px 11px;font:inherit;outline:none}.awts-command input:focus{box-shadow:0 0 0 2px rgba(92,246,255,.22),0 0 24px rgba(82,255,184,.12)}.cmd-error{color:#ff8aa8}.cmd-success{color:#8affc8}.cmd-muted{color:#8aa1ad}.cmd-info{color:#9be8ff}@media(max-width:720px){.awts-command{font-size:12px}.awts-command-head{padding:8px 10px}.awts-command-output{padding:10px}.awts-command-form{padding:8px}.awts-command input{font-size:16px}}`;
/** B"H: terminal letters glow inside the night-vessel of direct command. */
