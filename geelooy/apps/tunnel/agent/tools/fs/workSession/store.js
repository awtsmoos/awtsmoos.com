// B"H
// Boruch Hashem
// Blessed is He
const crypto = require("node:crypto");
const path = require("node:path");
const Device = require("../deviceStateRoot.js");
const Records = require("../workGraph/recordStore.js");
const Lock = require("../workGraph/recordLock.js");
/** The Awtsmoos preserves bounded continuation outside replaceable source files. */
const digest = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
function file(config, id, kind = "sessions") {
 if (typeof id !== "string" || !id || id.length > 160) throw Error("work_id_required");
 return path.join(Device.root(config), "work-verification", kind, digest(id) + ".json");
}
async function create(config, value, kind = "sessions") {
 if (Buffer.byteLength(JSON.stringify(value)) > 512 * 1024) throw Error("work_record_too_large");
 await Records.createImmutableJson(file(config, value.id, kind), value); return value;
}
async function get(config, id, kind = "sessions") {
 const value = await Records.readJson(file(config,id,kind));
 if (!value) throw Error("work_record_not_found"); return value;
}
async function update(config, id, revision, mutate) {
 return Lock.run(file(config,id),async()=>{
  const current = await get(config,id);
  if (!Number.isSafeInteger(revision) || revision !== current.revision) throw Error("work_revision_conflict");
  const next = await mutate(structuredClone(current));
  next.id=current.id;next.revision=current.revision+1;next.updatedAt=new Date().toISOString();
  if (Buffer.byteLength(JSON.stringify(next)) > 512*1024) throw Error("work_record_too_large");
  await Records.writeJson(file(config,id),next);return next;
 });
}
module.exports={create,get,update,file,digest};
