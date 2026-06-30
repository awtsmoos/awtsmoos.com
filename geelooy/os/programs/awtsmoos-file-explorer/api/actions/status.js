// B"H
export function statusText({ controller }) { const s = controller.selection(); const items = controller.getRenderItems(); return `${items.length} item(s), ${s.count} selected`; }
/** B"H: status strips speak counts from controller truth. */
