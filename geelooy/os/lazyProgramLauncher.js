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
 * A stalled program fetch must never trap its window on "Opening …" forever:
 * the launch below races a hard deadline, then reveals a retryable failure
 * surface instead of hanging. Late-resolving imports are dropped; the user can
 * retry, which reuses the cached module registry entry.
 */
const PROGRAM_LOAD_TIMEOUT_MS = 20_000;

/**
 * Races one program-load promise against a timeout.
 * @param {Promise|*} load Load promise (or plain value) to await.
 * @param {string} label Human-readable load name for diagnostics.
 * @returns {Promise<*>} The load result.
 * @throws {Error} When the load exceeds the deadline.
 */
function withLoadTimeout(load, label) {
	let timer = null;
	const deadline = new Promise((_, reject) => {
		timer = setTimeout(
			() => reject(new Error(`${label} timed out after ${PROGRAM_LOAD_TIMEOUT_MS / 1000}s`)),
			PROGRAM_LOAD_TIMEOUT_MS
		);
	});
	return Promise.race([Promise.resolve(load), deadline])
		.finally(() => { if (timer) clearTimeout(timer); });
}

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
			const module = await withLoadTimeout(import(modulePath), `${name} module`);
			if (closed) {
				return;
			}
			const factory = module.default;
			if (typeof factory !== "function") {
				throw new TypeError(`Program ${name} has no default launcher.`);
			}
			actual = await withLoadTimeout(factory(options), `${name} launch`) || {};
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
		host.replaceChildren();
		host.dataset.programLoadError = "true";
		const message = document.createElement("p");
		message.className = "awtsmoos-lazy-program-error";
		message.textContent = `Could not open ${name}. ${error?.message || String(error || "")}`.trim();
		const retry = document.createElement("button");
		retry.type = "button";
		retry.className = "awtsmoos-lazy-program-retry";
		retry.textContent = `↻ Retry ${name}`;
		retry.setAttribute("aria-label", `Retry opening ${name}`);
		retry.addEventListener("click", () => {
			delete host.dataset.programLoadError;
			host.textContent = `Opening ${name}…`;
			void hydrate();
		});
		host.append(message, retry);
		options.system?.makeToast?.(
			error?.message || String(error),
			"error",
			"program-load"
		);
		console.error(`B\"H ${name} program load failed.`, error);
	}
}
