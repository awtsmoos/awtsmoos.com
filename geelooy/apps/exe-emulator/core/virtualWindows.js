// B"H
import { createWebGlRenderer } from './webglRenderer.js';

/**
 * Virtual Windows manager: the browser becomes a soft Win32 desktop.
 * Drawing uses native WebGL first, then 2D canvas as a safe fallback.
 * @param {HTMLElement} desktop virtual desktop element
 * @param {HTMLElement} consoleEl console element
 * @returns {{clear:Function, print:Function, openWindow:Function, updateWindow:Function, draw:Function}}
 */
export function createVirtualWindows(desktop, consoleEl) {
  const state = { nextId: 1, windows: new Map() };
  return {
    clear() {
      state.windows.clear();
      desktop.innerHTML = '';
      consoleEl.textContent = '';
    },
    print(line) {
      consoleEl.textContent += `${line}\n`;
    },
    openWindow(title, body) {
      const id = state.nextId++;
      const win = document.createElement('article');
      win.className = 'virtual-window';
      win.dataset.windowId = String(id);
      win.innerHTML = `<header>${escapeHtml(title)}</header><div class="window-body">${escapeHtml(body)}</div><canvas class="window-canvas" width="300" height="180"></canvas>`;
      desktop.appendChild(win);
      const canvas = win.querySelector('canvas');
      const renderer = canvas ? createWebGlRenderer(canvas) : null;
      state.windows.set(id, { id, title, body, element: win, canvas, renderer, ops: [] });
      return id;
    },
    updateWindow(id, patch = {}) {
      const item = state.windows.get(id) || [...state.windows.values()].at(-1);
      if (!item) return;
      Object.assign(item, patch);
      const body = item.element.querySelector('.window-body');
      if (body && patch.body !== undefined) body.textContent = patch.body;
    },
    draw(op) {
      const item = [...state.windows.values()].at(-1);
      if (!item) return;
      item.ops.push(op);
      if (item.renderer?.draw?.(op)) return;
      draw2d(item.canvas, op);
    }
  };
}

function draw2d(canvas, op) {
  const ctx = canvas?.getContext?.('2d');
  if (!ctx) return;
  if (op.type === 'text') ctx.fillText(op.text, op.x || 20, op.y || 40);
  if (op.type === 'pixel-line') {
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(220, 160);
    ctx.stroke();
  }
  if (op.type === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(150, 20);
    ctx.lineTo(40, 150);
    ctx.lineTo(260, 150);
    ctx.closePath();
    ctx.stroke();
  }
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}
