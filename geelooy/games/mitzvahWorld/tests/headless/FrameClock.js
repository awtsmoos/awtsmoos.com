// B"H
/**
 * Headless frame clock: the Awtsmoos lends time a measured garment.
 * It advances without a browser so boot loops, retry loops, and scheduler
 * promises can be tested as vessels instead of wishes.
 */
export function createFrameClock({ frameMs = 1000 / 60 } = {}) {
  let now = 0;
  let id = 0;
  const queue = [];

  function requestAnimationFrame(callback) {
    id += 1;
    queue.push({ id, callback });
    return id;
  }

  function cancelAnimationFrame(targetId) {
    const index = queue.findIndex(item => item.id === targetId);
    if (index >= 0) queue.splice(index, 1);
  }

  async function step(count = 1) {
    for (let i = 0; i < count; i += 1) {
      now += frameMs;
      const batch = queue.splice(0, queue.length);
      for (const item of batch) item.callback(now);
      await Promise.resolve();
    }
    return now;
  }

  async function drain(limit = 240) {
    let frames = 0;
    while (queue.length && frames < limit) {
      await step(1);
      frames += 1;
    }
    return frames;
  }

  return { requestAnimationFrame, cancelAnimationFrame, step, drain, now: () => now, frameMs };
}
