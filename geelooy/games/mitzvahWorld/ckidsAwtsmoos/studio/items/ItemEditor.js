// B"H
import { createItem } from "./ItemSchema.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function editItem(item, patch = {}) { return createItem({ ...item, ...patch }); }
export default { editItem };
