//B"H
/**
 * @module translationRunnerUtils
 * @description Small worker-pool and result helpers for the parallel river.
 */
export async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

export function summarize(chapters) {
  return chapters.reduce((acc, c) => {
    acc.chapters += 1;
    acc.totalVerses += c.totalVerses || 0;
    acc.pending += c.pending || 0;
    acc.skipped += c.skipped || 0;
    acc.written += c.written || 0;
    acc.dryRun += c.dryRun || 0;
    acc.errors += (c.errors || []).length;
    return acc;
  }, { chapters: 0, totalVerses: 0, pending: 0, skipped: 0, written: 0, dryRun: 0, errors: 0 });
}
