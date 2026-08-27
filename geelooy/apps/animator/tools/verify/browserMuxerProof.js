// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { CdpSession } from './browser/CdpSession.js';

/**
 * Browser muxing is proven by the produced vessel, never by a hopeful status.
 * The Awtsmoos renews Chrome, WebCodecs, MP4, and sound while Awtsmoos.com uses
 * ffprobe only after the browser has independently created and downloaded it.
 */
const cdpOrigin = process.env.AWTSMOOS_CDP_ORIGIN || 'http://127.0.0.1:9222';
const pageUrl = process.env.AWTSMOOS_MUXER_PROOF_URL
	|| 'http://127.0.0.1:4173/geelooy/apps/animator/tools/browser-export/muxerProof.html';
const outputDirectory = resolve(
	process.env.AWTSMOOS_MUXER_PROOF_DIR
		|| '../../../ai_thoughts/2026-07-13T2042-animator-browser-muxer-realism/muxer-proof'
);
const outputFile = resolve(outputDirectory, 'awtsmoos-browser-muxer-proof.mp4');
const reportFile = resolve(outputDirectory, 'browser-muxer-proof.json');

mkdirSync(outputDirectory, { recursive: true });
for (const file of [outputFile, reportFile]) {
	if (existsSync(file)) {
		rmSync(file);
	}
}

const targetResponse = await fetch(
	`${cdpOrigin}/json/new?${encodeURIComponent(`${pageUrl}?proof=${Date.now()}`)}`,
	{ method: 'PUT' }
);
assert.equal(targetResponse.ok, true, 'Chrome target creation failed.');
const target = await targetResponse.json();
const session = await new CdpSession(target.webSocketDebuggerUrl).connect();

try {
	await enableBrowser(session, outputDirectory);
	await session.send('Page.navigate', { url: `${pageUrl}?proof=${Date.now()}` });
	const state = await waitForCompletion(session);
	assert.equal(state.state, 'complete', state.error || 'Browser muxer did not complete.');
	await waitForFile(outputFile);
	const probe = inspect(outputFile);
	assertMedia(probe);
	const report = buildReport(session, state, outputFile, probe);
	writeFileSync(reportFile, JSON.stringify(report, null, 2));
	assert.equal(report.exceptions.length, 0, 'Browser runtime exception detected.');
	assert.equal(report.severeLogs.length, 0, 'Browser warning or error detected.');
	console.log(JSON.stringify(report, null, 2));
} finally {
	session.close();
}

async function enableBrowser(session, downloadPath) {
	await session.send('Page.enable');
	await session.send('Runtime.enable');
	await session.send('Log.enable');
	await session.send('Network.enable');
	await session.send('Network.setCacheDisabled', { cacheDisabled: true });
	await session.send('Browser.setDownloadBehavior', {
		behavior: 'allow',
		downloadPath,
		eventsEnabled: true
	});
}

function buildReport(session, state, file, probe) {
	const bytes = readFileSync(file);
	return {
		ok: true,
		browserState: state,
		outputFile: file,
		bytes: bytes.length,
		sha256: createHash('sha256').update(bytes).digest('hex'),
		probe,
		exceptions: session.events.filter(event => (
			event.method === 'Runtime.exceptionThrown'
		)),
		severeLogs: session.events.filter(event => (
			event.method === 'Log.entryAdded'
			&& ['error', 'warning'].includes(event.params?.entry?.level)
		))
	};
}

async function waitForCompletion(session) {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		const state = await session.evaluate(
			'window.__AWTSMOOS_MUXER_PROOF__ || { state: "missing" }'
		);
		if (['complete', 'error'].includes(state.state)) {
			return state;
		}
		await session.wait(250);
	}
	return { state: 'error', error: 'Browser muxer proof timed out.' };
}

async function waitForFile(file) {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		if (existsSync(file) && readFileSync(file).length > 1000) {
			return;
		}
		await new Promise(resolvePromise => setTimeout(resolvePromise, 250));
	}
	throw new Error('Browser-created MP4 was not downloaded.');
}

function inspect(file) {
	const result = spawnSync('ffprobe', [
		'-v',
		'error',
		'-show_entries',
		'format=duration,size:stream=codec_name,codec_type,width,height,sample_rate,channels',
		'-of',
		'json',
		file
	], { encoding: 'utf8' });
	assert.equal(result.status, 0, result.stderr || 'ffprobe failed.');
	return JSON.parse(result.stdout);
}

function assertMedia(probe) {
	const video = probe.streams.find(stream => stream.codec_type === 'video');
	const audio = probe.streams.find(stream => stream.codec_type === 'audio');
	assert.equal(video?.codec_name, 'h264');
	assert.equal(video?.width, 320);
	assert.equal(video?.height, 180);
	assert.equal(audio?.codec_name, 'aac');
	assert.ok(Number(probe.format.duration) >= 2.9);
	assert.ok(Number(probe.format.duration) <= 3.1);
}
