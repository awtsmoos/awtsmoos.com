
// B"H
import { TaskManifestor } from '../../core/ui/TaskManifestor.js';

export class EditorManifestor {
  static bindToState(editor) {
    editor.state.subscribe('character', async (data) => {
      if (editor._isUpdating) return;
      editor._isUpdating = true;
      await TaskManifestor.manifest('SOUL_ATTRIBUTES', 12);
      editor.render();
      editor._isUpdating = false;
    });
  }
}
