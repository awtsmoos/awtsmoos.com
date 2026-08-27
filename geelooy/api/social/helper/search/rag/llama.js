// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialRagLlama
 * @description
 * Local vectors are used only when their runner and model already exist. Setup and
 * download happen solely when an explicit caller authorizes installation.
 */

const fs = require('fs');
const { ragRoot } = require('./paths.js');
const {
	runnerState,
	ensureModelDownloaded,
	embedTextAuto
} = require('../../../../../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');
const {
	commands,
	runInstall
} = require('./llamaInstall.js');

async function ensureLlama({ $i, autoInstall = false } = {}) {
	const modelRoot = ragRoot($i);
	fs.mkdirSync(modelRoot, { recursive: true });
	if (autoInstall) {
		await ensureModelDownloaded({ modelRoot }).catch(() => null);
	}
	let state = readState(modelRoot);
	let install = null;
	if (!state.llama?.ok && autoInstall) {
		install = runInstall(modelRoot);
		state = readState(modelRoot);
	}
	return {
		ok: Boolean(state.llama?.ok),
		state,
		install,
		installCommands: commands(modelRoot)
	};
}

async function embedQuery({ $i, query, autoInstall = false }) {
	const ready = await ensureLlama({
		$i,
		autoInstall
	});
	if (!ready.ok) throw unavailable(ready.state);
	const embedding = await embedTextAuto(query, {
		modelRoot: ragRoot($i),
		embeddingMode: 'llama',
		noFallback: true,
		fresh: true
	});
	return {
		vector: embedding.vector,
		embedder: {
			ready,
			provider: embedding.provider,
			cached: embedding.cached
		}
	};
}

function readState(modelRoot) {
	return runnerState({
		modelRoot,
		embeddingMode: 'llama'
	});
}

function unavailable(readiness) {
	return Object.assign(
		new Error('Local vector embedder is unavailable.'),
		{
			code: 'EMBEDDER_UNAVAILABLE',
			readiness
		}
	);
}

module.exports = {
	commands,
	embedQuery,
	ensureLlama
};
