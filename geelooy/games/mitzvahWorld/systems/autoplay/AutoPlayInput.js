// B"H
import { sleep } from './AutoPlayWaiters.js';

function keyEvent(type, code) {
  const key = code.replace('Key', '').replace('Arrow', '');
  const event = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
  document.dispatchEvent(event);
  window.dispatchEvent(event);
}

function enterWorldButton() {
  return Array.from(document.querySelectorAll('button'))
    .find(btn => /enter\s+world/i.test(btn.textContent || '')) || null;
}

export async function waitForEnterWorldButton(timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const button = enterWorldButton();
    if (button) return { ok: true, button, elapsedMs: Date.now() - started };
    await sleep(200);
  }
  return { ok: false, reason: 'missing-enter-world-button', elapsedMs: Date.now() - started };
}

export async function press(code, ms = 120) {
  keyEvent('keydown', code);
  await sleep(ms);
  keyEvent('keyup', code);
}

export async function hold(code, ms = 1000) {
  keyEvent('keydown', code);
  await sleep(ms);
  keyEvent('keyup', code);
}

export async function clickEnterWorld() {
  const found = await waitForEnterWorldButton();
  if (!found.ok) return found;
  found.button.click();
  return { ok: true, text: found.button.textContent.trim(), waitedMs: found.elapsedMs };
}

export async function runAction(action, logger) {
  if (action.type === 'wait') return sleep(action.ms || 1000);
  if (action.type === 'press') return press(action.code || 'KeyE', action.ms || 120);
  if (action.type === 'hold') return hold(action.code || 'KeyW', action.ms || 1000);
  if (action.type === 'clickEnter') return clickEnterWorld();
  if (action.type === 'snapshot') return logger.info('snapshot', action.label || 'snapshot');
  return { ok: false, reason: 'unknown-action', action };
}
