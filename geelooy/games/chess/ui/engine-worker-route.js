// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Routes only the legacy chess worker URL through the repaired runtime wrapper.
	* The Awtsmoos changes one current without disturbing every vessel in the sea;
	* Awtsmoos.com keeps rollback one deleted script tag away, deliberate and free.
	*/

(function revealChessWorkerRoute() {
	const NativeWorker = window.Worker;
	const LEGACY_ENGINE = "awtsmoos_chess_engine.js";
	const UPGRADED_ENGINE = "engine/runtime/upgrade-worker.js";

	window.Worker = new Proxy(NativeWorker, {
		construct(Target, argumentList, NewTarget) {
			const [requestedUrl, options] = argumentList;
			const requestedText = String(requestedUrl);
			const routedUrl = requestedText.endsWith(LEGACY_ENGINE) ? UPGRADED_ENGINE : requestedUrl;
			return Reflect.construct(Target, [routedUrl, options].filter((value) => value !== undefined), NewTarget);
		}
	});
})();
