//B"H
//Boruch Hashem
//Blessed is He

const fs = require('node:fs');
const WebSocket = require('ws');

const baseUrl = 'http://127.0.0.1:8155/geelooy/games/sefira-clash';
const reportPath = 'geelooy/games/sefira-clash/.reports/massive-city-browser-proof.json';
const cityShot = 'geelooy/games/sefira-clash/.reports/massive-city-world.png';
const serviceShot = 'geelooy/games/sefira-clash/.reports/massive-city-service.png';
const trainingShot = 'geelooy/games/sefira-clash/.reports/massive-city-training.png';
const adventureShot = 'geelooy/games/sefira-clash/.reports/massive-city-adventure.png';
const handsShot = 'geelooy/games/sefira-clash/.reports/massive-city-hands.png';
const evidence = { startedAt: new Date().toISOString(), steps: [], browserErrors: [] };
let target = null;
let page = null;

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitFor(label, probe, timeout = 30000) {
	const started = Date.now();
	let last = null;
	while (Date.now() - started < timeout) {
		try {
			last = await probe();
		} catch {}
		if (last) return last;
		await delay(100);
	}
	throw new Error(`Timed out waiting for ${label}; last=${JSON.stringify(last)}`);
}

class CdpPage {
	constructor(debuggerUrl) {
		this.sequence = 0;
		this.pending = new Map();
		this.socket = new WebSocket(debuggerUrl);
		this.ready = new Promise((resolve, reject) => {
			this.socket.once('open', resolve);
			this.socket.once('error', reject);
		});
		this.socket.on('message', message => this.receive(JSON.parse(message.toString())));
	}

	receive(message) {
		if (message.id) {
			const pending = this.pending.get(message.id);
			if (!pending) return;
			this.pending.delete(message.id);
			if (message.error) pending.reject(new Error(message.error.message));
			else pending.resolve(message.result || {});
			return;
		}
		if (message.method === 'Runtime.exceptionThrown') {
			evidence.browserErrors.push({
				type: 'exception',
				text: message.params.exceptionDetails.exception?.description
					|| message.params.exceptionDetails.text
			});
		}
		if (message.method === 'Runtime.consoleAPICalled') {
			const type = message.params.type;
			if (type === 'error' || type === 'warning') {
				evidence.browserErrors.push({
					type,
					text: message.params.args.map(argument => argument.value || argument.description || '').join(' ')
				});
			}
		}
	}

	async command(method, params = {}) {
		await this.ready;
		const id = ++this.sequence;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async evaluate(expression) {
		const response = await this.command('Runtime.evaluate', {
			expression,
			awaitPromise: true,
			returnByValue: true
		});
		if (response.exceptionDetails) {
			throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
		}
		return response.result?.value;
	}

	close() {
		this.socket.close();
	}
}

async function createPage() {
	const response = await fetch('http://127.0.0.1:9222/json/new?about%3Ablank', { method: 'PUT' });
	if (!response.ok) throw new Error(`Chrome target failed: ${response.status}`);
	target = await response.json();
	page = new CdpPage(target.webSocketDebuggerUrl);
	await page.command('Runtime.enable');
	await page.command('Page.enable');
	await page.command('Page.addScriptToEvaluateOnNewDocument', { source: seedSource() });
	await page.command('Page.navigate', { url: `${baseUrl}/index.html` });
}

function seedSource() {
	const profile = {
		version: 2,
		xp: 1200,
		perutas: 800,
		reputation: {
			malchus: 40,
			yesod: 12,
			hod: 12,
			netzach: 12,
			tiferes: 12,
			gevurah: 12,
			chesed: 12,
			binah: 12,
			chochmah: 12,
			keser: 12
		},
		discovered: ['malchus-citadel'],
		cleared: [],
		inventory: ['training-sword', 'woven-vest', 'travel-mantle', 'path-boots', 'spark-charm'],
		equipped: {
			weapon: 'training-sword',
			armor: 'woven-vest',
			mantle: 'travel-mantle',
			boots: 'path-boots',
			relic: 'spark-charm'
		},
		quests: {},
		materials: {},
		crafted: [],
		serviceClaims: [],
		weatherClock: 4,
		activeLocationId: 'malchus-citadel',
		sync: { profileId: '', revision: 0, syncedAt: 0 }
	};
	return `try {
		localStorage.clear();
		localStorage.setItem('sefiraClashProfile', JSON.stringify({ headwear: 'kippah', hue: 182, ready: true }));
		localStorage.setItem('sefiraClashExpeditionV1', JSON.stringify(${JSON.stringify(profile)}));
	} catch {}`;
}

async function press(code, key, milliseconds = 70) {
	await page.command('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
	await delay(milliseconds);
	await page.command('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
}

async function hold(code, key, milliseconds) {
	await page.command('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
	await delay(milliseconds);
	await page.command('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
}

async function moveToX(targetX, tolerance = 48) {
	for (let attempt = 0; attempt < 45; attempt += 1) {
		const currentX = await page.evaluate(`globalThis.__sefiraClashDebug.state().fighters.find(fighter => fighter.human).x`);
		const delta = targetX - currentX;
		if (Math.abs(delta) <= tolerance) return currentX;
		const right = delta > 0;
		const duration = Math.min(550, Math.max(90, Math.abs(delta) * 1.5));
		await hold(right ? 'KeyD' : 'KeyA', right ? 'd' : 'a', duration);
		await delay(80);
	}
	throw new Error(`Could not walk to x=${targetX}`);
}

async function worldShape() {
	return page.evaluate(`(() => {
		const state = globalThis.__sefiraClashDebug.state();
		return {
			human: state.fighters.find(fighter => fighter.human),
			doors: state.openWorld.scenes.street.openWorld.doors,
			nodes: state.openWorld.scenes.street.openWorld.traversalNodes,
			citizens: state.openWorld.activeCitizens,
			interiorId: state.openWorld.interiorId,
			prompt: state.openWorld.prompt,
			combat: state.openWorld.combat,
			performance: state.openWorld.performance
		};
	})()`);
}

async function enterDoor(destination) {
	const shape = await worldShape();
	const door = shape.doors.find(item => item.destination === destination);
	if (!door) throw new Error(`Door missing: ${destination}`);
	await moveToX(door.x + door.w / 2);
	await waitFor(`${destination} prompt`, async () => {
		const prompt = await page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.prompt`);
		return prompt.includes(door.label) ? prompt : null;
	});
	await press('Enter', 'Enter');
	await waitFor(`${destination} interior`, async () => {
		return (await page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.interiorId`)) === destination;
	});
}

async function useCurrentService() {
	const serviceX = await page.evaluate(`(() => {
		const state = globalThis.__sefiraClashDebug.state();
		const service = state.openWorld.scenes.interiors[state.openWorld.interiorId].openWorld.serviceNode;
		return service.x + service.w / 2;
	})()`);
	await moveToX(serviceX);
	await waitFor('service prompt', async () => {
		const prompt = await page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.prompt`);
		return prompt.includes('ENTER') ? prompt : null;
	});
	await press('Enter', 'Enter');
	await waitFor('service overlay', () => page.evaluate(`!document.getElementById('openWorldOverlay').classList.contains('hidden')`));
}

async function closeOverlay() {
	await page.evaluate(`([...document.querySelectorAll('#openWorldOverlay button')]
		.find(button => button.textContent.includes('Return to Room'))).click()`);
	await waitFor('overlay close', () => page.evaluate(`document.getElementById('openWorldOverlay').classList.contains('hidden')`));
}

async function exitInterior() {
	const exitX = await page.evaluate(`(() => {
		const state = globalThis.__sefiraClashDebug.state();
		const door = state.openWorld.scenes.interiors[state.openWorld.interiorId].openWorld.doors[0];
		return door.x + door.w / 2;
	})()`);
	await moveToX(exitX);
	await waitFor('exit prompt', async () => {
		const prompt = await page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.prompt`);
		return prompt.includes('Return to') ? prompt : null;
	});
	await press('Enter', 'Enter');
	await waitFor('street return', () => page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.interiorId === null`));
}

async function screenshot(filePath) {
	const image = await page.command('Page.captureScreenshot', { format: 'png' });
	fs.writeFileSync(filePath, Buffer.from(image.data, 'base64'));
}

async function sampleAnimationFrames() {
	return page.evaluate(`new Promise(resolve => {
		const times = [];
		let previous = 0;
		function frame(now) {
			if (previous) times.push(now - previous);
			previous = now;
			if (times.length >= 120) {
				const sorted = [...times].sort((a, b) => a - b);
				resolve({
					averageMs: times.reduce((sum, value) => sum + value, 0) / times.length,
					p95Ms: sorted[Math.floor(sorted.length * 0.95)],
					frames: times.length
				});
				return;
			}
			requestAnimationFrame(frame);
		}
		requestAnimationFrame(frame);
	})`);
}

async function proveOpenWorld() {
	await waitFor('main menu', () => page.evaluate(`Boolean(globalThis.__sefiraClashDebug)
		&& [...document.querySelectorAll('button')].some(button => button.textContent.includes('Open World'))`));
	const raf = await sampleAnimationFrames();
	await page.evaluate(`([...document.querySelectorAll('button')]
		.find(button => button.textContent.includes('Open World'))).click()`);
	const initial = await waitFor('open world state', async () => {
		const value = await page.evaluate(`(() => {
			const state = globalThis.__sefiraClashDebug.state();
			if (state.mode !== 'openworld') return null;
			return {
				doors: state.openWorld.scenes.street.openWorld.doors.length,
				traversal: state.openWorld.scenes.street.openWorld.traversalNodes.length,
				citizens: state.openWorld.citizens.length,
				active: state.openWorld.activeCitizens.length,
				ambient: state.openWorld.ambientParticles.length
			};
		})()`);
		return value?.doors === 10 && value?.traversal === 7 ? value : null;
	});
	await screenshot(cityShot);
	evidence.steps.push({ name: 'physical-city-start', ok: true, ...initial, raf });

	await enterDoor('shlichus');
	await useCurrentService();
	await page.evaluate(`(() => {
		const card = [...document.querySelectorAll('.openWorldCard')]
			.find(item => item.textContent.includes('Three-Point Patrol'));
		card.querySelector('button').click();
	})()`);
	await waitFor('patrol mission active', () => page.evaluate(`globalThis.__sefiraClashDebug.openWorld().profile.missions['three-point-patrol']?.status === 'active'`));
	await closeOverlay();
	await exitInterior();

	const patrols = (await worldShape()).nodes.filter(node => node.kind === 'patrol').sort((a, b) => a.x - b.x);
	for (const patrol of patrols) {
		await moveToX(patrol.x + patrol.w / 2, 35);
		await waitFor(`patrol prompt ${patrol.id}`, async () => {
			const prompt = await page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.prompt`);
			return prompt.includes('Patrol') ? prompt : null;
		});
		await press('Enter', 'Enter');
		await delay(160);
	}
	const patrolState = await waitFor('patrol stage complete', async () => {
		const mission = await page.evaluate(`globalThis.__sefiraClashDebug.openWorld().profile.missions['three-point-patrol']`);
		return mission?.stageIndex === 1 ? mission : null;
	});
	evidence.steps.push({ name: 'physical-three-point-patrol', ok: true, patrolState });

	const citizen = await page.evaluate(`(() => {
		const state = globalThis.__sefiraClashDebug.state();
		const doors = state.openWorld.scenes.street.openWorld.doors;
		const nodes = state.openWorld.scenes.street.openWorld.traversalNodes;
		const score = citizen => Math.min(
			...doors.map(item => Math.abs(citizen.x - (item.x + item.w / 2))),
			...nodes.map(item => Math.abs(citizen.x - (item.x + item.w / 2)))
		);
		return [...state.openWorld.activeCitizens].sort((a, b) => score(b) - score(a))[0] || null;
	})()`);
	if (!citizen) throw new Error('No scheduled street citizen was active.');
	await moveToX(citizen.x, 30);
	await waitFor('citizen prompt', async () => {
		const prompt = await page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.prompt`);
		return prompt.includes('Speak with') ? prompt : null;
	});
	await press('Enter', 'Enter');
	await waitFor('dialogue overlay', () => page.evaluate(`!document.getElementById('openWorldOverlay').classList.contains('hidden')`));
	await page.evaluate(`([...document.querySelectorAll('#openWorldOverlay button')]
		.find(button => button.textContent.includes('Speak and Remember'))).click()`);
	await waitFor('citizen remembered', () => page.evaluate(`globalThis.__sefiraClashDebug.openWorld().profile.knownCitizens.length > 0`));
	evidence.steps.push({ name: 'scheduled-citizen-dialogue', ok: true, citizenId: citizen.id, citizenName: citizen.name });
	await closeOverlay();

	await enterDoor('shlichus');
	await useCurrentService();
	await waitFor('patrol mission complete', () => page.evaluate(`globalThis.__sefiraClashDebug.openWorld().profile.missions['three-point-patrol']?.status === 'complete'`));
	await page.evaluate(`(() => {
		const card = [...document.querySelectorAll('.openWorldCard')]
			.find(item => item.textContent.includes('Three-Point Patrol'));
		card.querySelector('button').click();
	})()`);
	await waitFor('patrol mission claimed', () => page.evaluate(`globalThis.__sefiraClashDebug.openWorld().profile.missions['three-point-patrol']?.status === 'claimed'`));
	await closeOverlay();
	await exitInterior();
	evidence.steps.push({ name: 'patrol-return-and-claim', ok: true });

	await enterDoor('archive');
	await useCurrentService();
	await page.evaluate(`([...document.querySelectorAll('#openWorldOverlay button')]
		.find(button => button.textContent.includes('Inspect Civic Records'))).click()`);
	const archive = await waitFor('archive visit', () => page.evaluate(`(() => {
		const profile = globalThis.__sefiraClashDebug.openWorld().profile;
		return profile.civicVisits.archive === 1 ? {
			visits: profile.civicVisits.archive,
			clues: profile.dialogueFlags.length,
			rumors: profile.rumors.length
		} : null;
	})()`));
	await screenshot(serviceShot);
	evidence.steps.push({ name: 'physical-archive-service', ok: true, ...archive });
	await closeOverlay();
	await exitInterior();

	await enterDoor('training');
	const trainerX = await page.evaluate(`globalThis.__sefiraClashDebug.state().fighters.find(fighter => !fighter.human).x`);
	await moveToX(trainerX - 70, 25);
	for (let index = 0; index < 6; index += 1) {
		await press('KeyF', 'f', 80);
		await delay(420);
	}
	const training = await waitFor('posture pressure', () => page.evaluate(`(() => {
		const combat = globalThis.__sefiraClashDebug.openWorld().state.combat;
		return combat.partnerPosture < 100 ? {
			posture: combat.posture,
			partnerPosture: combat.partnerPosture,
			technique: combat.techniqueName,
			telegraph: combat.partnerTelegraph
		} : null;
	})()`), 15000);
	await screenshot(trainingShot);
	evidence.steps.push({ name: 'training-posture-technique', ok: true, ...training });

	const performance = await page.evaluate(`(() => {
		const state = globalThis.__sefiraClashDebug.openWorld().state;
		return {
			last: state.performance.last,
			worstFrameMs: state.performance.worstFrameMs,
			overBudgetFrames: state.performance.overBudgetFrames,
			samples: state.performance.samples.length,
			activeCitizens: state.activeCitizenCount,
			sleepingCitizens: state.sleepingCitizenCount
		};
	})()`);
	if (performance.samples > 180 || performance.activeCitizens > 12 || performance.last.ambientParticles > 48) {
		throw new Error(`Performance cap exceeded: ${JSON.stringify(performance)}`);
	}
	evidence.steps.push({ name: 'bounded-performance-telemetry', ok: true, ...performance });
}

async function proveAdventureAndHands() {
	await page.evaluate(`document.getElementById('restart').click()`);
	await waitFor('mode menu again', () => page.evaluate(`([...document.querySelectorAll('button')]
		.some(button => button.textContent.includes('Classic Adventure')))`));
	await page.evaluate(`([...document.querySelectorAll('button')]
		.find(button => button.textContent.includes('Classic Adventure'))).click()`);
	const adventure = await waitFor('adventure vows', () => page.evaluate(`(() => {
		const card = document.querySelector('.levelCard');
		return card && card.textContent.includes('Shlichus') ? {
			cards: document.querySelectorAll('.levelCard').length,
			firstCard: card.textContent.replace(/\s+/g, ' ').trim()
		} : null;
	})()`));
	await screenshot(adventureShot);
	evidence.steps.push({ name: 'adventure-optional-shlichus-ui', ok: true, cards: adventure.cards, firstCardHasShlichus: adventure.firstCard.includes('Shlichus') });

	await page.evaluate(`document.getElementById('restart').click()`);
	await waitFor('quick vs menu', () => page.evaluate(`([...document.querySelectorAll('button')]
		.some(button => button.textContent.includes('Quick VS')))`));
	await page.evaluate(`([...document.querySelectorAll('button')]
		.find(button => button.textContent.includes('Quick VS'))).click()`);
	await waitFor('hands mode card', () => page.evaluate(`Boolean([...document.querySelectorAll('[data-mode-id]')]
		.find(button => button.textContent.includes('Hands Covenant')))`));
	await page.evaluate(`([...document.querySelectorAll('[data-mode-id]')]
		.find(button => button.textContent.includes('Hands Covenant'))).click()`);
	await waitFor('hands selected', () => page.evaluate(`document.querySelector('[data-mode-id="hands"]')?.getAttribute('aria-pressed') === 'true'`));
	await page.evaluate(`(() => {
		const ready = [...document.querySelectorAll('button')]
			.find(button => button.textContent.trim() === 'Ready');
		ready?.click();
	})()`);
	await waitFor('choose arena enabled', () => page.evaluate(`(() => {
		const button = [...document.querySelectorAll('button')]
			.find(item => item.textContent.includes('Choose Arena'));
		return button && !button.disabled ? true : false;
	})()`));
	await page.evaluate(`([...document.querySelectorAll('button')]
		.find(button => button.textContent.includes('Choose Arena'))).click()`);
	await waitFor('arena grid', () => page.evaluate(`document.querySelectorAll('.menuCard').length > 0`));
	await page.evaluate(`document.querySelector('.menuCard').click()`);
	const hands = await waitFor('hands state', () => page.evaluate(`(() => {
		const state = globalThis.__sefiraClashDebug.state();
		return state.mode === 'vs' && state.rules?.handsOnly ? {
			phase: state.phase,
			rules: state.rules,
			weaponCount: state.weaponCount,
			powerupCount: state.powerupCount,
			fighterHandsOnly: state.fighters.every(fighter => fighter.loadout?.handsOnly === true)
		} : null;
	})()`));
	if (hands.rules.items || hands.weaponCount || hands.powerupCount || !hands.fighterHandsOnly) {
		throw new Error(`Hands Covenant leaked item state: ${JSON.stringify(hands)}`);
	}
	await screenshot(handsShot);
	evidence.steps.push({ name: 'hands-covenant-authoritative-ui', ok: true, ...hands });
}

(async () => {
	try {
		await waitFor('static server', async () => (await fetch(`${baseUrl}/index.html`)).status === 200);
		await createPage();
		await proveOpenWorld();
		await proveAdventureAndHands();
		if (evidence.browserErrors.length) {
			throw new Error(`Browser errors: ${JSON.stringify(evidence.browserErrors)}`);
		}
		evidence.ok = true;
	} catch (error) {
		evidence.ok = false;
		evidence.error = error.stack || String(error);
		process.exitCode = 1;
	} finally {
		evidence.finishedAt = new Date().toISOString();
		fs.writeFileSync(reportPath, JSON.stringify(evidence, null, '\t'));
		if (page) page.close();
		if (target?.id) {
			try {
				await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
			} catch {}
		}
	}
})();
