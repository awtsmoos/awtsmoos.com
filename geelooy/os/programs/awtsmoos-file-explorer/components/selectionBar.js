// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';

export default function createSelectionBar({ controller, os, onCancel }) {
  const bar = createElement({ tag:'div', attributes:{ class:'selection-action-bar' }, children:[
    { tag:'span', attributes:{ class:'selection-count' }, html:'0 selected' },
    { tag:'button', html:'Cut', on:{ click:() => cut(controller, os, onCancel) } },
    { tag:'button', attributes:{ class:'cancel-btn' }, html:'Cancel', on:{ click:onCancel } }
  ] });
  function update() { const count = controller.selection().count; bar.querySelector('.selection-count').textContent = `${count} selected`; }
  update();
  return { dom:bar, update };
}

function cut(controller, os, done) {
  const paths = controller.selection().paths;
  os.clipboard = { action:'cut', paths, path:paths[0], name:paths[0]?.split('/').pop() };
  done?.();
}

/** B"H: selection actions hover like a small court above the desktop sea. */
