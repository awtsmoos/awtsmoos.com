// B"H
/**
 * @file main.js
 * @brief Main menu exposing native Code Chat and Vibe Code separately.
 */

import { State, DOM } from '../state.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';
import { GitMetaProvider } from '../git/meta.js';

function baseItems() {
  return [
    { label: 'New File', action: 'new-temp-file', icon: 'file' },
    { label: 'Open File...', action: 'open-file', icon: 'folder' },
    { label: 'Open Local Browser', action: 'open-browser-tab', icon: 'globe' },
    { isSeparator: true },
    { label: 'Code Chat: This File', action: 'open-code-chat-file', icon: 'brain-circuit' },
    { label: 'Code Chat: All Workspaces', action: 'open-code-chat-global', icon: 'brain-circuit' },
    { label: 'Open /geelooy/ai Chat', action: 'open-generic-ai-chat', icon: 'brain-circuit' },
    { label: 'Vibe Code', action: 'open-vibe-context', icon: 'brain-circuit' },
    { isSeparator: true }
  ];
}

function addContextItems(menuItems, activeTab, gitInfo) {
  const isHtml = activeTab?.item?.name?.toLowerCase()?.endsWith('.html');
  const isPreview = activeTab?.fileType === 'html-preview';
  if (isHtml && !isPreview) menuItems.push({ label: 'Preview HTML', action: 'view-html', icon: 'eye' });
  if (isPreview) menuItems.push({ label: 'Open DevTools', action: 'open-devtools', icon: 'laptop' });
  if (gitInfo) menuItems.push({ label: 'Commit Changes', action: 'commit-changes', icon: 'git-branch' });
}

function addTail(menuItems, activeTab) {
  menuItems.push(
    { isSeparator: true },
    { label: 'Beautify Code', action: 'beautify', icon: 'brain' },
    { label: 'Save File', action: 'save', icon: 'save', disabled: !activeTab || !activeTab.isDirty },
    { isSeparator: true },
    { label: 'Select All', action: 'select-all', icon: 'select-all', disabled: !activeTab },
    { label: 'Copy All', action: 'copy-all', icon: 'copy', disabled: !activeTab },
    { label: 'Copy as Markdown', action: 'copy-all-contents', icon: 'clipboard', disabled: !activeTab },
    { label: 'Download Context', action: 'download-all-contents', icon: 'download', disabled: !activeTab },
    { isSeparator: true },
    { label: 'Find / Replace', action: 'find-replace', icon: 'search' },
    { label: 'Visual Settings', action: 'visual-settings', icon: 'eye' },
    { label: 'App Settings', action: 'settings', icon: 'settings' },
    { isSeparator: true },
    { label: 'Help & Docs', action: 'show-docs', icon: 'brain' }
  );
}

export const MainMenu = {
  async show(e) {
    if (e) e.stopPropagation();
    if (DOM.mainMenu.style.display === 'block') {
      Menus.hideAll();
      return;
    }

    Menus.hideAll();
    const activeTab = State.tabs.find(t => t.id === State.activeTabId);
    const gitInfo = activeTab?.item ? await GitMetaProvider.getGitInfoForFolder(activeTab.item) : null;
    const menuItems = baseItems();
    addContextItems(menuItems, activeTab, gitInfo);
    addTail(menuItems, activeTab);

    const btnRect = DOM.hamburgerMenuBtn.getBoundingClientRect();
    MenuUI.renderMenu(DOM.mainMenu, menuItems, { clientX: btnRect.left, clientY: btnRect.bottom + 8 });
    setTimeout(() => document.addEventListener('click', MenuUI.handleDocumentClick, { once: true }), 10);
  }
};
