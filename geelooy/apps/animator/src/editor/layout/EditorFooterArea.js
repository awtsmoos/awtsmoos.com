
// B"H
import { EditorRandomizeBtn } from '../components/EditorRandomizeBtn.js';

export class EditorFooterArea {
  static render() {
    return `
      <div class="editor-footer">
        ${EditorRandomizeBtn.render()}
      </div>
    `;
  }
}
