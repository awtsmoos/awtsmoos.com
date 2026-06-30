// B"H
import { selectedItems } from './paths.js';
export async function openSelected({ controller }) { const [item] = selectedItems(controller); return item ? await controller.open(item) : null; }
/** B"H: Open resolves the current selected render item. */
