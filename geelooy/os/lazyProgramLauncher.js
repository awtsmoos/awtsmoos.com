//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LazyProgramLauncher
 * @description
 * The Awtsmoos lets the desktop awaken before every possible program is downloaded;
 * Awtsmoos.com loads one program module only when a user actually opens that vessel.
 */

/**
 * Creates one synchronous program record backed by a deferred dynamic import.
 * @param {string} name Human-readable program title.
 * @param {string} modulePath Module URL relative to this OS root module.
 * @returns {Readonly<{name:string,launch:Function}>} Lazy program registry record.
 */
export function lazyProgram(name, modulePath) {
	return Object.freeze({
		name,
		launch: options => lazyInstance(name, modulePath, options)
	});
}

/** Returns a placeholder program instance immediately while its real module loads. */
function lazyInstance(name, modulePath, options = {}) {
	const host = document.createElement("div");
	host.className = "awtsmoos-lazy-program-host";
	host.textContent = `Opening ${name}…`;
	let actual = null;
	let closed = false;
	let initRequested = false;
	let lastResize = null;
	const instance = {
		div: host,
		init() {
			initRequested = true;
			actual?.init?.();
		},
		onresize(event) {
			lastResize = event;
			actual?.onresize?.(event);
		},
		onclose() {
			closed = true;
			actual?.onclose?.();
		}
	};
	void hydrate();
	return instance;

	async function hydrate() {
		try {
			const module = await import(modulePath);
			if (closed) {
				return;
			}
			const factory = module.default;
			if (typeof factory !== "function") {
				throw new TypeError(`Program ${name} has no default launcher.`);
			}
			actual = await factory(options) || {};
			if (closed) {
				actual?.onclose?.();
				return;
			}
			if (actual.div) {
				host.replaceChildren(actual.div);
			}
			if (initRequested) {
				actual?.init?.();
			}
			if (lastResize) {
				actual?.onresize?.(lastResize);
			}
		} catch (error) {
			revealFailure(error);
		}
	}

	function revealFailure(error) {
		host.textContent = `Could not open ${name}.`;
		host.dataset.programLoadError = "true";
		options.system?.makeToast?.(
			error?.message || String(error),
			"error",
			"program-load"
		);
		console.error(`B\"H ${name} program load failed.`, error);
	}
}
