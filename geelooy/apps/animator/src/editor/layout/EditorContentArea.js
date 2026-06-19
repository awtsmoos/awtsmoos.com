
// B"H
import { EditorRender } from '../core/render.js';

export class EditorContentArea {
  static render(editor) {
    return `
      <div class="editor-content scrollable">
        ${EditorRender.controls(editor)}
      </div>
    `;
  }
}
