//B"H

/**
 * Chapter 83: The Last Spark Refused To Be Buried.
 *
 * Streams arrive as numbered stones from a storm. The Awtsmoos orders them by
 * index before any packet touches the renderer, so tool traces, image notices,
 * file references, and the final assistant text descend in the same sequence the
 * provider carved into the river.
 *
 * @param {Array<object>} chunks Raw extension ledger chunks.
 * @returns {Array<object>} Chunks sorted by numeric stream index.
 */
export function orderedChunks(chunks = []) {
  return [...(Array.isArray(chunks) ? chunks : [])]
    .filter(chunk => chunk && chunk.chunk)
    .sort((a, b) => Number(a?.index || 0) - Number(b?.index || 0));
}

/**
 * @param {number} cursor Current cursor.
 * @param {object} chunk Consumed chunk.
 * @returns {number} Cursor after this chunk.
 */
export function cursorAfterChunk(cursor, chunk = {}) {
  return Math.max(Number(cursor || 0), Number(chunk.index || 0) + 1);
}

/**
 * @param {*} packet Stream packet or normalized provider object.
 * @returns {string} Best visible assistant text carried by the packet.
 */
export function extractAssistantText(packet) {
  if (typeof packet === "string") return packet;
  return packet?.content?.parts?.[0]
    || packet?.message?.content?.parts?.[0]
    || packet?.data?.message?.content?.parts?.[0]
    || packet?.text
    || "";
}
