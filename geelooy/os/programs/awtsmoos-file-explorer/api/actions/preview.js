// B"H
import { selectedItems } from './paths.js';
export async function previewSelected({ controller }) { const [item] = selectedItems(controller); return item ? await controller.open(item) : null; }
/** B"H: Preview is an open action with future room for binary viewers. */
