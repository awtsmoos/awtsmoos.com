// B"H
/** @file HandAttachmentRuntime.js @description Parents sword, bow, staff, or letter vessel to the hand. */
import { resolveHandBone } from "./HandBoneResolver.js";
import { gripOffset } from "./GripOffsetCatalog.js";
export class HandAttachmentRuntime {
  constructor(runtime) { this.runtime = runtime; this.attachments = new Map(); }
  attach({ actorId, actorRoot, item, mesh, side = "right" } = {}) {
    const anchor = resolveHandBone(actorRoot, side), offset = gripOffset(item?.grip);
    const record = { actorId, itemId:item?.id, side, anchorName:anchor.name, offset, visible:Boolean(mesh), attached:false };
    if (anchor.ok && mesh?.position) { anchor.bone.add?.(mesh); Object.assign(mesh.position, offset.position); Object.assign(mesh.rotation, offset.rotation); Object.assign(mesh.scale, offset.scale); record.attached = true; }
    this.attachments.set(`${actorId}:${item?.id}`, record); this.runtime?.registerEntity?.({ id:`equip_${actorId}_${item?.id}`, kind:"equipmentAttachment", tags:["equipment", item?.id], ...record }); return record;
  }
  detach(actorId, itemId) { const key = `${actorId}:${itemId}`, old = this.attachments.get(key); this.attachments.delete(key); return { ok:Boolean(old), detached:old }; }
  snapshot() { return { count:this.attachments.size, attachments:[...this.attachments.values()] }; }
}
export function createHandAttachmentRuntime(runtime) { return new HandAttachmentRuntime(runtime); }
export default createHandAttachmentRuntime;
