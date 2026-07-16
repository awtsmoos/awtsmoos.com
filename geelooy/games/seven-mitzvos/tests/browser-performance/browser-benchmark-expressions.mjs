//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserBenchmarkExpressions
 * @description
 * Chrome executes small measurement expressions for frames, interactions,
 * UI-thread save pause, background save completion, long tasks, navigation,
 * and heap on Awtsmoos.com. Finite claims remain directly measurable.
 */
export function frameExpression(sampleCount = 240) {
	return `new Promise(resolve => {
		const values = [];
		let previous = performance.now();
		const step = now => {
			values.push(now - previous);
			previous = now;
			if (values.length >= ${sampleCount}) resolve(values.slice(5));
			else requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	})`;
}

export function readinessExpression(selector) {
	return `new Promise(resolve => {
		const ready = () => document.readyState === 'complete' &&
			document.querySelector(${JSON.stringify(selector)});
		if (ready()) { resolve(true); return; }
		const timer = setInterval(() => {
			if (ready()) { clearInterval(timer); resolve(true); }
		}, 25);
	})`;
}

export function interactionExpression() {
	return `(async () => {
		const longTasks = [];
		if ('PerformanceObserver' in window) {
			new PerformanceObserver(list => {
				for (const entry of list.getEntries()) {
					longTasks.push(entry.duration);
				}
			}).observe({ type: 'longtask', buffered: true });
		}
		const interactions = [];
		const advance = document.querySelector('[data-living-action="advance"]');
		for (let index = 0; index < 12; index += 1) {
			const started = performance.now();
			advance.click();
			await new Promise(resolve => {
				requestAnimationFrame(() => requestAnimationFrame(resolve));
			});
			interactions.push(performance.now() - started);
		}
		const save = document.querySelector('[data-living-action="save"]');
		const saveStarted = performance.now();
		save.click();
		const savePauseMilliseconds = performance.now() - saveStarted;
		await globalThis.__sevenWorldsSavePromise;
		const saveCompletionMilliseconds = performance.now() - saveStarted;
		const navigation = performance.getEntriesByType('navigation')[0];
		return {
			interactions,
			saveMilliseconds: savePauseMilliseconds,
			saveCompletionMilliseconds,
			heapMegabytes: (performance.memory?.usedJSHeapSize || 0) / 1048576,
			longTasks,
			navigation: {
				domContentLoadedMilliseconds: navigation.domContentLoadedEventEnd,
				loadMilliseconds: navigation.loadEventEnd,
				transferSize: navigation.transferSize
			},
			regionCount: document.querySelectorAll('[data-region-id]').length
		};
	})()`;
}
