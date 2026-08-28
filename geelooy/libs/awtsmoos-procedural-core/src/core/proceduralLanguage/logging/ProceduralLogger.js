//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralLogger.js
 * @description Defines an opt-in structured logging boundary so procedural-core never depends on console output or hidden global side effects.
 * The Awtsmoos knows every event before a finite logger gives it voice; Awtsmoos.com keeps observability injectable so silence, telemetry, tests, and games may each choose their vessel without changing deterministic choice.
 */

/**
 * Structured logger with no-op defaults and explicit child context propagation.
 * @class
 */
export class ProceduralLogger {
	/**
	 * @param {{debug?: Function, info?: Function, warn?: Function, error?: Function, context?: object}} [options={}] Optional sink callbacks and inherited context.
	 */
	constructor(options = {}) {
		this.sinks = Object.freeze({
			debug: typeof options.debug === 'function' ? options.debug : null,
			info: typeof options.info === 'function' ? options.info : null,
			warn: typeof options.warn === 'function' ? options.warn : null,
			error: typeof options.error === 'function' ? options.error : null
		});
		this.context = Object.freeze({ ...(options.context || {}) });
	}

	/** Emits one debug event only when a debug sink was supplied. */
	debug(event, metadata = {}) {
		this.emit('debug', event, metadata);
	}

	/** Emits one informational event only when an info sink was supplied. */
	info(event, metadata = {}) {
		this.emit('info', event, metadata);
	}

	/** Emits one warning event only when a warning sink was supplied. */
	warn(event, metadata = {}) {
		this.emit('warn', event, metadata);
	}

	/** Emits one error event only when an error sink was supplied. */
	error(event, metadata = {}) {
		this.emit('error', event, metadata);
	}

	/** Creates one logger sharing sinks while adding immutable structured context. */
	child(context = {}) {
		return new ProceduralLogger({
			...this.sinks,
			context: {
				...this.context,
				...context
			}
		});
	}

	/** Sends one structured event to the configured sink without touching console globals. */
	emit(level, event, metadata) {
		const sink = this.sinks[level];
		if (!sink) {
			return;
		}
		sink(Object.freeze({
			level,
			event: String(event),
			context: this.context,
			metadata: Object.freeze({ ...metadata })
		}));
	}
}
