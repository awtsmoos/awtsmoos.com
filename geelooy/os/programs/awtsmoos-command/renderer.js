// B"H
export function renderCommand({ root, history, onSubmit }) {
  root.innerHTML = `<div class="awts-command-output"></div><form class="awts-command-form"><span>$</span><input aria-label="Awtsmoos command" autocomplete="off" /></form>`;
  const output = root.querySelector('.awts-command-output'); const form = root.querySelector('form'); const input = root.querySelector('input');
  form.addEventListener('submit', event => { event.preventDefault(); const value = input.value; input.value = ''; onSubmit(value); });
  function draw() { output.textContent = history.lines().join('\n'); output.scrollTop = output.scrollHeight; }
  draw(); setTimeout(() => input.focus(), 0);
  return { draw };
}
export const commandCss = `.awts-command{height:100%;display:flex;flex-direction:column;background:#050b14;color:#d7f9ff;font:13px Monaco,Consolas,monospace}.awts-command-output{flex:1;white-space:pre-wrap;overflow:auto;padding:14px}.awts-command-form{display:flex;gap:8px;padding:10px;border-top:1px solid #1d4ed8;background:#020817}.awts-command input{flex:1;background:#07111f;color:#ecfeff;border:1px solid #2563eb;border-radius:6px;padding:8px}`;
/** B"H: The renderer is a black-blue well where commands echo like sparks. */
