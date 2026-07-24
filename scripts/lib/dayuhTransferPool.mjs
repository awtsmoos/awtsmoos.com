// B"H

/** Runs a bounded transfer pool and emits sparse progress instead of per-file noise. */
export async function transferPool(paths, concurrency, worker, progress = () => {}) {
	let next = 0;
	let completed = 0;
	let bytes = 0;
	async function lane() {
		while (true) {
			const index = next;
			next += 1;
			if (index >= paths.length) return;
			const path = paths[index];
			bytes += Number(await worker(path) || 0);
			completed += 1;
			if (completed % 100 === 0 || completed === paths.length) {
				progress({ completed, total: paths.length, bytes, path });
			}
		}
	}
	const width = Math.max(1, Math.min(Number(concurrency) || 1, paths.length || 1));
	await Promise.all(Array.from({ length: width }, () => lane()));
	return { completed, bytes };
}
