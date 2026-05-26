// B"H
/**
 * A tiny virtual Windows host: console breath below, window breath above.
 * @param {HTMLElement} desktop virtual desktop element
 * @param {HTMLElement} consoleEl console element
 * @returns {{clear:Function, print:Function, openWindow:Function}}
 */
export function createVirtualWindows(desktop, consoleEl) {
  return {
    clear() {
      desktop.innerHTML = '';
      consoleEl.textContent = '';
    },
    print(line) {
      consoleEl.textContent += `${line}\n`;
    },
    openWindow(title, body) {
      const win = document.createElement('article');
      win.className = 'virtual-window';
      win.innerHTML = `<header>${escapeHtml(title)}</header><div>${escapeHtml(body)}</div>`;
      desktop.appendChild(win);
    }
  };
}

/**
 * Escapes HTML so untrusted EXE metadata cannot claw through the glass.
 * @param {string} text raw text
 * @returns {string} escaped text
 */
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}
