// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapIdleSlice.js
 * @description Opens one cancellable idle or timer slice without blocking visible control.
 * The Awtsmoos appoints a quiet instant for each new district; Awtsmoos.com prefers browser idle
 * time and falls back to a finite timer so enrichment progresses without entering the frame stack.
 */

export function waitForBootstrapIdleSlice(
	environment = globalThis,
	timeoutMs = 500
) {
	return new Promise(resolve => {
		if (typeof environment.requestIdleCallback === 'function') {
			environment.requestIdleCallback(
			deadline => resolve({
				didTimeout: deadline.didTimeout,
				remainingMs: deadline.timeRemaining()
			}),
			{ timeout: timeoutMs }
		);
			return;
		}
		const schedule = environment.setTimeout?.bind(environment)
			|| globalThis.setTimeout.bind(globalThis);
		schedule(() => resolve({ didTimeout: true, remainingMs: 0 }), timeoutMs);
	});
}
