
// B"H
import { CommandPaletteState } from './CommandPaletteState.js';
import { CommandPaletteRenderer } from './CommandPaletteRenderer.js';
import { HTMLGenerator } from '../../ui/HTMLGenerator.js';

/**
 * @class CommandPaletteManager
 * @description
 * THE ORACLE OF OMNISCIENCE (Ba'al HaYediah).
 * B"H
 * Listens for the sacred keystroke (Ctrl+K or Cmd+K). When invoked, time stops, 
 * and the user is presented with a direct conduit to alter the universe.
 */
export class CommandPaletteManager {
  static container = null;
  static appCore = null;

  static init(appCore) {
    this.appCore = appCore;
    this._ensureVessel();
    this._bindGlobal();
  }

  static _ensureVessel() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'awtsmoos-command-palette';
      this.container.className = 'cmd-palette-mount hidden';
      document.body.appendChild(this.container);
    }
  }

  static _bindGlobal() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && CommandPaletteState.isOpen) {
        this.hide();
      }
    });

    // Close when clicking the void behind the palette
    document.addEventListener('click', (e) => {
      if (CommandPaletteState.isOpen && e.target.id === 'awtsmoos-command-palette') {
        this.hide();
      }
    });
  }

  static toggle() {
    if (CommandPaletteState.isOpen) this.hide();
    else this.show();
  }

  static show() {
    if (!this.container) return;
    CommandPaletteState.isOpen = true;
    CommandPaletteState.searchQuery = '';
    
    this._render();
    this.container.classList.remove('hidden');

    // Focus the input of intention
    setTimeout(() => {
      const input = document.getElementById('cmd-palette-input');
      if (input) input.focus();
    }, 50);
  }

  static hide() {
    if (!this.container) return;
    CommandPaletteState.isOpen = false;
    this.container.classList.add('hidden');
  }

  static _render() {
    const schema = CommandPaletteRenderer.render(this.appCore, this);
    this.container.innerHTML = '';
    this.container.appendChild(HTMLGenerator.generate(schema));
  }

  static triggerRefresh() {
    if (CommandPaletteState.isOpen) this._render();
  }
}
