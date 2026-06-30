// B"H
import { selectedItems } from './paths.js';
export async function editSelected({ controller }) { const [item] = selectedItems(controller); return item ? await controller.openInCode(item) : null; }
/** B"H: Edit sends the selected file to the code editor gate. */
