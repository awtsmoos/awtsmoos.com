// B"H
/**
 * @file inbox-panel.js
 * @description Chapter 543: A little status-bar candle lets the Code app hear
 * the living civilization inbox without stealing focus from the editor.
 */

import { SocialInboxClient } from './inbox-client.js';

function makeButton() {
  const button = document.createElement('button');
  button.id = 'awtsmoos-code-social-inbox-btn';
  button.className = 'icon-button';
  button.title = 'Awtsmoos Social Inbox';
  button.textContent = 'Inbox';
  return button;
}

function dialogHtml(alias, items) {
  const rows = items.slice(0, 20).map(item => {
    const mark = item.readAt ? '✓' : '•';
    const title = item.title || item.kind || item.id;
    return `<div>${mark} ${title}</div>`;
  }).join('') || '<p>No inbox items found.</p>';
  return `<div class="code-chat-panel"><h3>B"H Social Inbox</h3><p>Alias: ${alias || '(none)'}</p>${rows}</div>`;
}

async function askAlias(current) {
  const alias = prompt('Alias for Awtsmoos social inbox:', current || '');
  return alias ? SocialInboxClient.setAlias(alias) : current;
}

export const SocialInboxPanel = {
  button: null,
  async init() {
    const target = document.getElementById('status-right') || document.getElementById('custom-menu-container');
    if (!target || this.button) return;
    this.button = makeButton();
    this.button.onclick = () => this.open();
    target.appendChild(this.button);
    await this.refresh();
  },
  async refresh() {
    const alias = SocialInboxClient.getAlias();
    if (!this.button) return;
    if (!alias) { this.button.textContent = 'Inbox: alias'; return; }
    try {
      const data = await SocialInboxClient.unread(alias);
      const count = Number(data?.success?.count || 0);
      this.button.textContent = count ? `Inbox ${count}` : 'Inbox';
    } catch { this.button.textContent = 'Inbox'; }
  },
  async open() {
    const { UI } = await import('../ui.js');
    let alias = SocialInboxClient.getAlias();
    if (!alias) alias = await askAlias(alias);
    if (!alias) return UI.showToast('No alias selected for social inbox.', 'error');
    const data = await SocialInboxClient.list(alias).catch(error => ({ error }));
    const items = data?.success || [];
    await UI.showDialog({ title: 'B"H Social Inbox', contentHTML: dialogHtml(alias, items), okText: 'Close', cancelText: '' });
    await this.refresh();
  }
};
