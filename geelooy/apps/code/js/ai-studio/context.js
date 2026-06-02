// B"H
/**
 * @file context.js
 * @brief Active editor context for unified AI Studio.
 */

import { DOM, State } from '../state.js';
import { AiStudioSettings } from './settings.js';

function clip(text = '', limit = 14000) {
  const value = String(text || '');
  if (value.length <= limit) return value;
  const half = Math.floor(limit / 2);
  return value.slice(0, half) + '\n/* B"H clipped by AI Studio */\n' + value.slice(-half);
}

function activeTab() { return State.tabs.find(tab => tab.id === State.activeTabId) || null; }

export const AiStudioContext = {
  gather() {
    const tab = activeTab();
    const editor = DOM.editor;
    const code = editor?.value || tab?.content || '';
    const start = editor?.selectionStart || 0;
    const end = editor?.selectionEnd || start;
    const settings = AiStudioSettings.get();
    return {
      tab,
      filename: tab?.item?.name || 'untitled',
      path: tab?.item?.path || '',
      cursor: start,
      selectedText: settings.includeSelection ? clip(code.slice(start, end), 5000) : '',
      ast: settings.includeAst ? this.simpleAst(code, start) : null,
      code: clip(code)
    };
  },

  simpleAst(code = '', offset = 0) {
    const before = String(code).slice(0, offset);
    const line = before.split('\n').length;
    const functionMatch = [...String(code).matchAll(/function\s+([A-Za-z0-9_$]+)|(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(/g)]
      .map(match => ({ name: match[1] || match[2], index: match.index }))
      .filter(item => item.index <= offset)
      .pop();
    return { line, nearestSymbol: functionMatch?.name || '', parser: 'lightweight' };
  },

  toPrompt(packet) {
    return [
      `File: ${packet.filename}`,
      `Path: ${packet.path}`,
      `Cursor: ${packet.cursor}`,
      packet.ast ? `AST:\n${JSON.stringify(packet.ast, null, 2)}` : '',
      packet.selectedText ? `Selection:\n${packet.selectedText}` : '',
      `Code:\n${packet.code}`
    ].filter(Boolean).join('\n\n---\n\n');
  }
};
