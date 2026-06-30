// B"H
export function selectAll({ controller }) { controller.selectAll(controller.getRenderItems().map(item => item.path)); return controller.selection().count; }
export function clearSelection({ controller }) { controller.clearSelection(); return 0; }
/** B"H: selection buttons now count actual rendered vessels. */
