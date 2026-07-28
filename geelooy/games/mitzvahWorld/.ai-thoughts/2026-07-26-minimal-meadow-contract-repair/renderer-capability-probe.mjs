// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file renderer-capability-probe.mjs
 * @description Reads the live renderer error and tests fresh browser canvases through DevTools.
 * The Awtsmoos reveals whether a finite context failed before or after its birth;
 * Awtsmoos.com gathers GPU, shader, and runtime evidence from the living earth.
 */

const debugPort = Number(process.argv[2] || 9240);
const requestedUrl = process.argv[3] || 'http://localhost:8080/games/mitzvahWorld/';
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => {
	return response.json();
});
const target = targets.find((candidate) => candidate.url === requestedUrl)
	|| targets.find((candidate) => candidate.type === 'page');

if (!target?.webSocketDebuggerUrl) {
	throw new Error(`No debuggable page target exists for ${requestedUrl}`);
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pendingCommands = new Map();
let commandId = 0;

socket.addEventListener('message', (event) => {
	const message = JSON.parse(event.data);
	const pending = pendingCommands.get(message.id);

	if (!pending) {
		return;
	}

	pendingCommands.delete(message.id);
	message.error ? pending.reject(message.error) : pending.resolve(message.result);
});

await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});

const evaluation = await sendCommand('Runtime.evaluate', {
	expression: `(${browserProbe.toString()})()`,
	returnByValue: true
});

if (evaluation.exceptionDetails) {
	throw new Error(evaluation.exceptionDetails.text || 'Browser capability probe failed.');
}

console.log(JSON.stringify(evaluation.result.value, null, 2));
socket.close();

function sendCommand(method, params = {}) {
	commandId += 1;

	return new Promise((resolve, reject) => {
		pendingCommands.set(commandId, { reject, resolve });
		socket.send(JSON.stringify({ id: commandId, method, params }));
	});
}

function browserProbe() {
	const renderer = globalThis.AwtsmoosMitzvahWorld?.runtime?.renderer;
	const contexts = ['webgl2', 'webgl', 'experimental-webgl'].map((name) => {
		return inspectContext(name);
	});

	return {
		contexts,
		documentState: {
			dataset: { ...document.documentElement.dataset },
			visibilityState: document.visibilityState
		},
		navigator: {
			hardwareConcurrency: navigator.hardwareConcurrency,
			platform: navigator.platform,
			userAgent: navigator.userAgent,
			webGpu: Boolean(navigator.gpu)
		},
		runtimeRenderer: {
			backend: renderer?.backend || null,
			contextName: renderer?.contextName || null,
			errors: [...(renderer?.errors || [])],
			hydrationError: renderer?.hydrationError?.message || null,
			hydrationState: renderer?.hydrationState || null
		}
	};

	function inspectContext(name) {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext(name, {
			alpha: true,
			antialias: false,
			premultipliedAlpha: true
		});

		if (!context) {
			return {
				available: false,
				name
			};
		}

		const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
		return {
			attributes: context.getContextAttributes(),
			available: true,
			contextLost: context.isContextLost(),
			extensions: context.getSupportedExtensions()?.length || 0,
			name,
			renderer: debugInfo
				? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
				: context.getParameter(context.RENDERER),
			shaderProbe: inspectShaderProgram(context),
			vendor: debugInfo
				? context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
				: context.getParameter(context.VENDOR),
			version: context.getParameter(context.VERSION)
		};
	}

	function inspectShaderProgram(context) {
		const vertex = compileShader(
			context,
			context.VERTEX_SHADER,
			'attribute vec2 p; void main(){gl_Position=vec4(p,0.0,1.0);}'
		);
		const fragment = compileShader(
			context,
			context.FRAGMENT_SHADER,
			'precision mediump float; void main(){gl_FragColor=vec4(1.0);}'
		);
		const program = context.createProgram();
		context.attachShader(program, vertex.shader);
		context.attachShader(program, fragment.shader);
		context.linkProgram(program);
		const evidence = {
			fragmentCompiled: fragment.compiled,
			fragmentLog: fragment.log,
			linked: context.getProgramParameter(program, context.LINK_STATUS),
			linkLog: context.getProgramInfoLog(program),
			vertexCompiled: vertex.compiled,
			vertexLog: vertex.log
		};

		context.deleteProgram(program);
		context.deleteShader(vertex.shader);
		context.deleteShader(fragment.shader);
		return evidence;
	}

	function compileShader(context, type, source) {
		const shader = context.createShader(type);
		context.shaderSource(shader, source);
		context.compileShader(shader);

		return {
			compiled: context.getShaderParameter(shader, context.COMPILE_STATUS),
			log: context.getShaderInfoLog(shader),
			shader
		};
	}
}
