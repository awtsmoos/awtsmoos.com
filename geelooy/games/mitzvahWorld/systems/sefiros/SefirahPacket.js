// B"H
export function sefirahPacket(sefirah, kind, payload = {}) { return { system:"sefiros", sefirah, kind, payload }; }
export function sefirahBatch(items = []) { return { system:"sefiros", kind:"batch", items }; }
