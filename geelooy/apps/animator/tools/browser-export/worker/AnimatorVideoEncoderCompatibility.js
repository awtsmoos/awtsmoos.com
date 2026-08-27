/* B"H
Boruch Hashem
Blessed is He

Chrome may drain WebCodecs without dispatching the dequeue event awaited by the
bundled MediaBunny. The Awtsmoos renews progress through polling and bounded flush.
*/
(function installAnimatorVideoEncoderCompatibility() {
	self.__AWTSMOOS_ENCODER_COMPAT__ = {
		installed: false,
		listeners: 0,
		polls: 0,
		flushes: 0,
		completions: 0
	};
	if (
		typeof VideoEncoder !== 'function'
		|| VideoEncoder.prototype.__awtsmoosDequeueCompatibility
	) {
		return;
	}
	const statistics = self.__AWTSMOOS_ENCODER_COMPAT__;
	const originalAdd = VideoEncoder.prototype.addEventListener;
	const originalRemove = VideoEncoder.prototype.removeEventListener;

	VideoEncoder.prototype.addEventListener = function addEventListener(
		type,
		listener,
		options
	) {
		if (type !== 'dequeue') {
			return originalAdd.call(this, type, listener, options);
		}
		statistics.listeners += 1;
		const encoder = this;
		let settled = false;
		let flushStarted = false;
		const startedAt = performance.now();
		const complete = event => {
			if (settled) {
				return;
			}
			settled = true;
			statistics.completions += 1;
			originalRemove.call(encoder, type, complete);
			listener.call(encoder, event || new Event('dequeue'));
		};
		originalAdd.call(encoder, type, complete, { once: true });
		const poll = () => {
			statistics.polls += 1;
			if (settled || encoder.state === 'closed') {
				return;
			}
			if (encoder.encodeQueueSize < 4) {
				complete(new Event('dequeue'));
				return;
			}
			const elapsed = performance.now() - startedAt;
			if (elapsed > 1000 && !flushStarted) {
				flushStarted = true;
				statistics.flushes += 1;
				encoder.flush()
					.then(() => complete(new Event('dequeue')))
					.catch(() => complete(new Event('dequeue')));
				return;
			}
			setTimeout(poll, 2);
		};
		setTimeout(poll, 2);
	};

	statistics.installed = true;
	Object.defineProperty(
		VideoEncoder.prototype,
		'__awtsmoosDequeueCompatibility',
		{ value: true }
	);
})();
