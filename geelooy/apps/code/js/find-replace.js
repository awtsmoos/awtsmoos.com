// B"H
/**
 * @file find-replace.js
 * @brief Reliable find/replace for the textarea editor.
 *
 * Chapter 19: The Awtsmoos repaired the search lamp. The panel can rebuild
 * missing controls, count matches, wrap predictably, replace safely, and notify
 * the editor so tabs become dirty exactly when reality changes.
 */

import { DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';

export const FindReplace = {
  panel: null,
  findInput: null,
  replaceInput: null,
  caseSensitiveCheckbox: null,
  countNode: null,
  isFindSelectionActive: false,

  init() {
    this.panel = DOM.findReplacePanel;
    if (!this.panel) return;
    this.ensureMarkup();
    this.bindNodes();
    this.bindEvents();
  },

  show(prefillText = '') {
    if (!this.panel) this.init();
    if (!this.panel) return;
    if (prefillText) this.findInput.value = prefillText;
    this.panel.style.display = 'grid';
    this.updateCount();
    this.findInput.focus();
    this.findInput.select();
  },

  hide() {
    if (!this.panel) return;
    this.panel.style.display = 'none';
    this.isFindSelectionActive = false;
    Editor.focus();
  },

  find(reverse = false) {
    const query = this.findInput?.value || '';
    if (!query || !DOM.editor) return;
    const match = this.nextMatch(query, reverse);
    if (!match) return this.noMatch(query);
    this.selectMatch(match.index, query.length);
    this.updateCount(match.index);
  },

  replace() {
    const query = this.findInput?.value || '';
    if (!query || !DOM.editor) return;
    if (!this.selectionMatches(query)) return this.find(false);
    DOM.editor.setRangeText(this.replaceInput.value || '', DOM.editor.selectionStart, DOM.editor.selectionEnd, 'end');
    this.afterMutation();
    this.find(false);
  },

  replaceAll() {
    const query = this.findInput?.value || '';
    if (!query || !DOM.editor) return;
    const value = DOM.editor.value;
    const regex = this.regexFor(query, 'g');
    const matches = value.match(regex) || [];
    if (!matches.length) return this.noMatch(query);
    DOM.editor.value = value.replace(regex, this.replaceInput.value || '');
    this.afterMutation();
    this.updateCount();
    UI.showToast(`Replaced ${matches.length} occurrence${matches.length === 1 ? '' : 's'}.`, 'success');
  },

  ensureMarkup() {
    this.panel.innerHTML = `<div class="fr-row">
      <input type="text" id="find-input" placeholder="Find">
      <span id="find-count" class="find-count">0/0</span>
      <button id="find-prev-btn" type="button" title="Previous">↑</button>
      <button id="find-next-btn" type="button" title="Next">↓</button>
      <button id="find-close-btn" type="button" title="Close">×</button>
    </div>
    <div class="fr-row">
      <input type="text" id="replace-input" placeholder="Replace">
      <button id="replace-btn" type="button">Replace</button>
      <button id="replace-all-btn" type="button">All</button>
      <label class="fr-case"><input type="checkbox" id="fr-case-sensitive">Aa</label>
    </div>`;
  },

  bindNodes() {
    this.findInput = this.panel.querySelector('#find-input');
    this.replaceInput = this.panel.querySelector('#replace-input');
    this.caseSensitiveCheckbox = this.panel.querySelector('#fr-case-sensitive');
    this.countNode = this.panel.querySelector('#find-count');
  },

  bindEvents() {
    this.panel.querySelector('#find-next-btn').onclick = () => this.find(false);
    this.panel.querySelector('#find-prev-btn').onclick = () => this.find(true);
    this.panel.querySelector('#find-close-btn').onclick = () => this.hide();
    this.panel.querySelector('#replace-btn').onclick = () => this.replace();
    this.panel.querySelector('#replace-all-btn').onclick = () => this.replaceAll();
    this.findInput.addEventListener('input', () => this.updateCount());
    this.caseSensitiveCheckbox.addEventListener('change', () => this.updateCount());
    this.findInput.addEventListener('keydown', event => this.handleInputKey(event));
    this.replaceInput.addEventListener('keydown', event => this.handleReplaceKey(event));
    DOM.editor.addEventListener('mousedown', () => { this.isFindSelectionActive = false; });
  },

  handleInputKey(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.find(event.shiftKey);
    }
    if (event.key === 'Escape') this.hide();
  },

  handleReplaceKey(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.shiftKey ? this.replaceAll() : this.replace();
    }
    if (event.key === 'Escape') this.hide();
  },

  nextMatch(query, reverse) {
    const editor = DOM.editor;
    const body = this.caseFold(editor.value);
    const needle = this.caseFold(query);
    const from = reverse ? Math.max(0, editor.selectionStart - 1) : editor.selectionEnd;
    let index = reverse ? body.lastIndexOf(needle, from) : body.indexOf(needle, from);
    if (index === -1) index = reverse ? body.lastIndexOf(needle) : body.indexOf(needle, 0);
    return index === -1 ? null : { index };
  },

  selectMatch(index, length) {
    const editor = DOM.editor;
    editor.setSelectionRange(index, index + length);
    editor.focus();
    this.isFindSelectionActive = true;
    this.scrollToIndex(index);
  },

  scrollToIndex(index) {
    const before = DOM.editor.value.slice(0, index);
    const line = (before.match(/\n/g) || []).length;
    const lineHeight = parseFloat(getComputedStyle(DOM.editor).lineHeight) || 22;
    DOM.editor.scrollTo({ top: Math.max(0, line * lineHeight - DOM.editor.clientHeight / 2), behavior: 'smooth' });
  },

  selectionMatches(query) {
    const selected = DOM.editor.value.slice(DOM.editor.selectionStart, DOM.editor.selectionEnd);
    return this.caseFold(selected) === this.caseFold(query);
  },

  updateCount(activeIndex = DOM.editor?.selectionStart || 0) {
    if (!this.countNode || !DOM.editor) return;
    const query = this.findInput?.value || '';
    if (!query) return this.countNode.textContent = '0/0';
    const matches = [...DOM.editor.value.matchAll(this.regexFor(query, 'g'))];
    const current = matches.findIndex(match => match.index === activeIndex) + 1;
    this.countNode.textContent = `${Math.max(0, current)}/${matches.length}`;
  },

  regexFor(query, flags) {
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(safe, this.caseSensitiveCheckbox?.checked ? flags : flags + 'i');
  },

  caseFold(text) {
    return this.caseSensitiveCheckbox?.checked ? String(text) : String(text).toLowerCase();
  },

  afterMutation() {
    DOM.editor.dispatchEvent(new Event('input', { bubbles: true }));
  },

  noMatch(query) {
    this.isFindSelectionActive = false;
    this.updateCount();
    UI.showToast(`No occurrences of "${query}" found.`, 'info');
    this.findInput.focus();
    this.findInput.select();
  }
};
