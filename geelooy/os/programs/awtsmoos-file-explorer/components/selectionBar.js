// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
export default function createSelectionBar({ controller, os, onCancel }) {
  void os; const run = name => controller.command.run(name).then(() => onCancel?.());
  const bar = createElement({ tag:'div', attributes:{ class:'selection-action-bar xp-status-strip', 'data-button-audit':'selection-actions' }, children:[
    { tag:'span', attributes:{ class:'selection-count' }, html:'0 selected' },
    btn('Cut','cut',run), btn('Copy','copy',run), btn('Delete','delete',run), btn('Rename','rename',run),
    { tag:'button', attributes:{ class:'cancel-btn', 'data-action':'cancelSelection' }, html:'Cancel', on:{ click:onCancel } }
  ] });
  function update() { const count = controller.selection().count; bar.querySelector('.selection-count').textContent = `${count} selected`; }
  update(); return { dom:bar, update };
}
function btn(label, action, run) { return { tag:'button', attributes:{ 'data-action':action }, html:label, on:{ click:() => run(action) } }; }
/** B"H: selection bar buttons now run the same audited controller commands. */
