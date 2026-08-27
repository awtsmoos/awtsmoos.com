/* B"H
A tiny ordered queue for future WebCodecs->muxer HLS segments.
*/
export function makeSegmentQueue({ maxQueued = 12 } = {}) {
  const queue = [];
  let sending = false;
  return { push, flush, size: () => queue.length, busy: () => sending };
  function push(segment) {
    queue.push(segment);
    while (queue.length > maxQueued) queue.shift();
  }
  async function flush(send) {
    if (sending) return { skipped: true, queued: queue.length };
    sending = true;
    let sent = 0;
    try {
      while (queue.length) { await send(queue.shift()); sent += 1; }
      return { sent, queued: queue.length };
    } finally { sending = false; }
  }
}
