// B"H
function segmentName(input = {}) {
  const index = Number.isFinite(Number(input.index)) ? Number(input.index) : Date.now();
  const prefix = safeName(input.prefix || "seg");
  const extension = segmentExtension(input);
  return input.name || `${prefix}-${String(index).padStart(6, "0")}.${extension}`;
}
function addSegment(session, info = {}) {
  session.hls = session.hls || { sequence:0, targetDuration:2, segments:[], maxSegments:6 };
  if (info.mapUri || info.initSegmentName) session.hls.mapUri = info.mapUri || info.initSegmentName;
  if (info.contentType) session.hls.contentType = info.contentType;
  const segment = {
    name:segmentName(info),
    duration:Number(info.duration || session.hls.targetDuration || 2),
    bytes:Number(info.bytes || 0),
    contentType:info.contentType || session.hls.contentType || defaultContentType(info),
    createdAt:Date.now()
  };
  session.hls.segments.push(segment);
  while (session.hls.segments.length > session.hls.maxSegments) { session.hls.segments.shift(); session.hls.sequence += 1; }
  return segment;
}
function playlist(session, options = {}) {
  const hls = session.hls || { sequence:0, targetDuration:2, segments:[] };
  const version = hls.mapUri || isFmp4(hls) ? 7 : 3;
  const lines = ["#EXTM3U", `#EXT-X-VERSION:${version}`, `#EXT-X-TARGETDURATION:${Math.max(1, Math.ceil(hls.targetDuration || 2))}`, `#EXT-X-MEDIA-SEQUENCE:${hls.sequence || 0}`];
  if (hls.mapUri) lines.push(`#EXT-X-MAP:URI="${escapeAttribute(hls.mapUri)}"`);
  for (const segment of hls.segments) { lines.push(`#EXTINF:${Number(segment.duration || 2).toFixed(3)},`, segment.name); }
  if (options.endList || session.status === "closed") lines.push("#EXT-X-ENDLIST");
  return lines.join("\n") + "\n";
}
function segmentExtension(input = {}) {
  const explicit = String(input.extension || "").replace(/[^a-z0-9]+/gi, "").toLowerCase();
  if (explicit) return explicit;
  if (isFmp4(input)) return "m4s";
  return "ts";
}
function defaultContentType(input = {}) { return isFmp4(input) ? "video/iso.segment" : "video/mp2t"; }
function isFmp4(input = {}) { return /mp4|iso\.segment|m4s/i.test(`${input.contentType || ""} ${input.format || ""} ${input.name || ""}`); }
function escapeAttribute(value) { return String(value).replace(/"/g, "%22"); }
function safeName(value) { return String(value).replace(/[^a-z0-9_-]+/gi, "-").slice(0, 40) || "seg"; }
module.exports = { addSegment, playlist, segmentName, segmentExtension };
