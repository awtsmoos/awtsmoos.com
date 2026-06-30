// B"H
export function ownerMetadata(body = {}) {
  const data = body.data || {};
  const ownerId = data.ownerId || data.owner || data.doorId || data.id || body.id;
  const ownerType = data.ownerType || data.type || body.kind || "unknown";
  const source = data.source || data.visibleSource || data.id || body.id || null;
  return {
    id:body.id || null,
    kind:body.kind || "unknown",
    ownerId:ownerId || null,
    ownerType,
    source,
    solid:Boolean(body.solid),
    trigger:Boolean(body.trigger),
    label:data.label || data.name || ownerId || body.id || "unlabeled"
  };
}

export function hasCanonicalOwner(body = {}) {
  const data = body.data || {};
  if (!body.id || /^solid_[a-z0-9]+$/i.test(body.id)) return false;
  return Boolean(data.id || data.ownerId || data.doorId || body.kind);
}

export function explainBody(body = {}) {
  const owner = ownerMetadata(body);
  return `${owner.kind}:${owner.ownerId || owner.id || "unowned"}`;
}

export default { ownerMetadata, hasCanonicalOwner, explainBody };
