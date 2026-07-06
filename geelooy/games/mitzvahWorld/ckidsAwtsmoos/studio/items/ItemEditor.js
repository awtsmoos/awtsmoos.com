// B"H
import { createItem } from "./ItemSchema.js";
export function editItem(item, patch = {}) { return createItem({ ...item, ...patch }); }
export default { editItem };
