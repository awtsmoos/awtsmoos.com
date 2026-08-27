
// B"H
import { EditorTabsArea } from './EditorTabsArea.js';
import { EditorContentArea } from './EditorContentArea.js';
import { EditorFooterArea } from './EditorFooterArea.js';

export class EditorLayout {
  static render(editor) {
    return `
      <div class="editor-section">
        ${EditorTabsArea.render(editor)}
        ${EditorContentArea.render(editor)}
        ${EditorFooterArea.render()}
      </div>
    `;
  }
}
