// B"H
/**
 * @file AwtsmoosNovelModal.js
 * @description Modal for long AI revelations. Layout and color live in CSS.
 */
export class AwtsmoosNovelModal {
  static _overlay = null;
  static _panel = null;
  static _initialized = false;

  static init() {
    if (this._initialized) return;
    this._initialized = true;

    this._overlay = document.createElement('div');
    this._overlay.id = 'awtsmoos-revelation-panel';
    this._overlay.className = 'aw-revelation-overlay';

    this._panel = document.createElement('div');
    this._panel.id = 'awtsmoos-revelation-content';
    this._panel.className = 'bottom-sheet-modal aw-revelation-panel';

    this._overlay.appendChild(this._panel);
    document.body.appendChild(this._overlay);

    this._overlay.addEventListener('click', event => {
      if (event.target === this._overlay) this.hide();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !this._overlay.classList.contains('hidden')) this.hide();
    });
  }

  static show(text, title = 'THE REVELATION OF AWTSMOOS') {
    if (!this._initialized) this.init();
    if (!this._overlay || !this._panel) return;

    const safeText = this._escapeHTML(String(text || ''));
    const safeTitle = this._escapeHTML(String(title || 'THE REVELATION OF AWTSMOOS'));

    this._panel.innerHTML = `
      <div class="bottom-sheet-handle"></div>
      <header class="aw-revelation-header">
        <h2 class="aw-revelation-title">${safeTitle}</h2>
      </header>
      <div class="aw-revelation-body">${safeText}</div>
      <footer class="aw-revelation-footer">
        <button id="awtsmoos-modal-absorb" class="btn btn-primary aw-revelation-button">
          ABSORB_TRUTH — CLOSE
        </button>
      </footer>
    `;

    this._panel.querySelector('#awtsmoos-modal-absorb')?.addEventListener('click', () => this.hide());
    this._overlay.classList.remove('hidden');
    this._overlay.classList.add('visible');
    setTimeout(() => this._panel.classList.add('active'), 10);
  }

  static hide() {
    if (!this._panel || !this._overlay) return;
    this._panel.classList.remove('active');
    setTimeout(() => {
      this._overlay.classList.remove('visible');
      this._overlay.classList.add('hidden');
    }, 240);
  }

  static _escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
}
