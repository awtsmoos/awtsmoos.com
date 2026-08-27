//B"H

let taskCounter = 0;

/**
 * B"H
 * The Awtsmoos gives every export its own lantern: no download may swallow
 * another download, no ZIP may erase another ZIP, and each vessel shines in the
 * stack until the user dismisses it.
 * @param {string} title Human title for the task card.
 * @returns {{id:string,step:Function,done:Function,fail:Function,close:Function}}
 */
export function createDownloadTask(title = 'Download task') {
  ensureTaskStyles();
  const stack = ensureStack();
  const id = `rebbe-download-task-${Date.now()}-${++taskCounter}`;
  const card = document.createElement('section');
  card.className = 'download-task-card';
  card.dataset.taskId = id;
  card.innerHTML = taskHtml(title);
  stack.prepend(card);
  card.querySelector('[data-task-close]').onclick = () => card.remove();
  return taskApi(id, card);
}

function taskApi(id, card) {
  return {
    id,
    step(done, total, status, name = '') {
      const pct = percent(done, total);
      card.querySelector('[data-task-status]').textContent = status;
      card.querySelector('[data-task-name]').textContent = name;
      card.querySelector('[data-task-fill]').style.width = `${pct}%`;
      card.querySelector('[data-task-percent]').textContent = `${pct}%`;
    },
    done(status, lines = []) {
      card.classList.add('is-done');
      card.querySelector('[data-task-status]').textContent = status;
      card.querySelector('[data-task-fill]').style.width = '100%';
      card.querySelector('[data-task-percent]').textContent = '100%';
      writeLog(card, lines);
    },
    fail(error, lines = []) {
      card.classList.add('is-failed');
      card.querySelector('[data-task-status]').textContent = error?.message || error || 'Download failed';
      writeLog(card, lines);
    },
    close() { card.remove(); }
  };
}

function ensureStack() {
  let stack = document.getElementById('download-task-stack');
  if (stack) return stack;
  stack = document.createElement('div');
  stack.id = 'download-task-stack';
  stack.setAttribute('aria-live', 'polite');
  document.body.appendChild(stack);
  return stack;
}

function taskHtml(title) {
  return `<button type="button" data-task-close class="download-task-close">×</button><div class="download-task-kicker">parallel archive task</div><h3>${esc(title)}</h3><div data-task-status class="download-task-status">Starting…</div><div data-task-name class="download-task-name"></div><div class="download-task-track"><div data-task-fill class="download-task-fill"></div></div><div data-task-percent class="download-task-percent">0%</div><div data-task-log class="download-task-log"></div>`;
}

function writeLog(card, lines = []) {
  card.querySelector('[data-task-log]').innerHTML = lines.filter(Boolean).slice(0, 10).map(line => `<div>${esc(line)}</div>`).join('');
}

function percent(done, total) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

function ensureTaskStyles() {
  if (document.getElementById('download-task-styles')) return;
  const style = document.createElement('style');
  style.id = 'download-task-styles';
  style.textContent = `#download-task-stack{position:fixed;right:16px;bottom:calc(86px + env(safe-area-inset-bottom));z-index:10050;display:grid;gap:12px;width:min(430px,calc(100vw - 28px));pointer-events:none}.download-task-card{position:relative;pointer-events:auto;background:linear-gradient(145deg,rgba(0,12,16,.98),rgba(6,4,10,.98));border:1px solid rgba(0,243,255,.46);box-shadow:0 18px 55px rgba(0,0,0,.65),0 0 35px rgba(0,243,255,.14);border-radius:18px;padding:14px 16px;color:#eaffff;font-family:monospace}.download-task-close{position:absolute;right:10px;top:8px;border:1px solid rgba(255,0,85,.6);background:rgba(255,0,85,.16);color:#fff;border-radius:999px;width:28px;height:28px;cursor:pointer}.download-task-kicker{text-transform:uppercase;letter-spacing:2.5px;font-size:10px;color:var(--c-yellow)}.download-task-card h3{margin:4px 34px 8px 0;font-size:15px;color:#fff}.download-task-status{font-weight:900;color:var(--c-cyan)}.download-task-name{min-height:18px;margin:6px 0 9px;color:#a9c9c9;font-size:12px;word-break:break-word}.download-task-track{height:10px;border:1px solid rgba(0,243,255,.38);background:#020707;border-radius:999px;overflow:hidden}.download-task-fill{height:100%;width:0;background:linear-gradient(90deg,var(--c-cyan),var(--c-yellow));transition:width .18s ease}.download-task-percent{text-align:right;margin-top:4px;color:#fff;font-weight:900}.download-task-log{max-height:92px;overflow:auto;color:#9fb;font-size:11px;line-height:1.45}.download-task-card.is-done{border-color:rgba(255,204,0,.74)}.download-task-card.is-failed{border-color:rgba(255,0,85,.85)}@media(max-width:720px){#download-task-stack{left:10px;right:10px;bottom:calc(74px + env(safe-area-inset-bottom));width:auto}}`;
  document.head.appendChild(style);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}
