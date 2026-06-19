/* B”H */
import { TabListeners } from './categories/TabListeners.js';
import { ColorListeners } from './categories/ColorListeners.js';
import { SelectListeners } from './categories/SelectListeners.js';
import { RangeListeners } from './categories/RangeListeners.js';
import { ActionListeners } from './categories/ActionListeners.js';
import { ToggleListeners } from './categories/ToggleListeners.js';

export class ListenerManager {
  constructor(editor) {
    this.editor = editor;
  }

  bindAll() {
    TabListeners.bind(this.editor);
    ColorListeners.bind(this.editor);
    SelectListeners.bind(this.editor);
    RangeListeners.bind(this.editor);
    ActionListeners.bind(this.editor);
    ToggleListeners.bind(this.editor);
  }
}
