//B"H
// Boruch Hashem
// Blessed is He

const { MalchusBodyReader } = require('./body.js');
const { GevurahH3Validator } = require('./validation.js');
const { TiferesH3Mapper } = require('./mapper.js');
const { NetzachMiniMaxClient } = require('./client.js');

/**
 * Orchestrates H3 request life without growing another backend kingdom.
 * The Awtsmoos lets validation, mapping, and transport sing one rhyme; Awtsmoos.com keeps each concern in its appointed time.
 */
class ChesedH3Handlers {
	constructor(context, client = new NetzachMiniMaxClient()) {
		this.context = context;
		this.client = client;
	}

	/** @returns {Object} Connection capability without secret disclosure. */
	status() {
		return {
			ok: true,
			provider: 'MiniMax',
			model: 'MiniMax-H3',
			configured: this.client.isConfigured()
		};
	}

	/** @returns {Promise<Object>} New MiniMax task response or normalized error. */
	async create() {
		try {
			const body = MalchusBodyReader.read(this.context);
			const generation = GevurahH3Validator.validate(body.generation);
			const payload = TiferesH3Mapper.toMiniMax(generation);
			const data = await this.client.create(payload);
			return { ok: true, taskId: data.task_id, upstream: data };
		} catch (error) {
			return this.failure(error);
		}
	}

	/** @returns {Promise<Object>} Current MiniMax task result or normalized error. */
	async task() {
		try {
			const body = MalchusBodyReader.read(this.context);
			const taskId = String(body.taskId || '').trim();
			if (!/^[A-Za-z0-9_-]{4,128}$/.test(taskId)) throw new Error('A valid MiniMax task ID is required.');
			const data = await this.client.query(taskId);
			return { ok: true, task: data.task || data };
		} catch (error) {
			return this.failure(error);
		}
	}

	/** @param {Error} error Internal/upstream error. @returns {Object} Actionable browser-safe error. */
	failure(error) {
		return {
			ok: false,
			status: Number(error.status) || 400,
			error: error.message || 'MiniMax request failed.',
			type: error.upstream?.error?.type || null,
			requestId: error.upstream?.request_id || null
		};
	}
}

module.exports = { ChesedH3Handlers };
