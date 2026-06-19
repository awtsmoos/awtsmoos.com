/* B”H */
import { ListenerManager } from '../listeners/Manager.js';

export class EditorListeners {
  static bind(editor) {
    const manager = new ListenerManager(editor);
    manager.bindAll();
  }
}
