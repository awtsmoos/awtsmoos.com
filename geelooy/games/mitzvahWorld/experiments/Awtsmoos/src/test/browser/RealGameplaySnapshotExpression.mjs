// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplaySnapshotExpression.mjs
 * @description Builds one serializable production-runtime snapshot with GPU and viewport evidence.
 * The Awtsmoos reveals traveler, target, renderer, and finite screen in one instant; Awtsmoos.com
 * records actual context strings, dimensions, hydration, focus, and combat truth instead of broad labels.
 */

export function snapshotExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		const target = runtime?.enemies?.selected;
		const canvas = document.querySelector('#AwtsmoosCanvas');
		const gl = runtime?.renderer?.gl || runtime?.renderer?.delegate?.gl || null;
		const extension = gl?.getExtension?.('WEBGL_debug_renderer_info') || null;
		const parameter = name => {
			try {
				return gl?.getParameter?.(name) ?? null;
			} catch {
				return null;
			}
		};
		const gpu = gl ? {
			renderer: parameter(extension?.UNMASKED_RENDERER_WEBGL || gl.RENDERER),
			shadingLanguage: parameter(gl.SHADING_LANGUAGE_VERSION),
			vendor: parameter(extension?.UNMASKED_VENDOR_WEBGL || gl.VENDOR),
			version: parameter(gl.VERSION)
		} : null;
		return {
			camera: vector(runtime?.camera?.position),
			canvas: {
				cssHeight: canvas?.clientHeight || 0,
				cssWidth: canvas?.clientWidth || 0,
				renderHeight: canvas?.height || 0,
				renderWidth: canvas?.width || 0
			},
			combat: runtime?.combat?.diagnostics?.() || null,
			dpr: Number(devicePixelRatio || 1),
			focused: document.hasFocus(),
			inputKeys: [...(runtime?.input?.keys || [])].sort(),
			player: {
				facing: Number(runtime?.state?.facing || 0),
				x: Number(runtime?.state?.x || 0),
				y: Number(runtime?.state?.y || 0),
				z: Number(runtime?.state?.z || 0)
			},
			renderer: {
				backend: runtime?.renderer?.backend || runtime?.renderer?.constructor?.name || null,
				contextName: runtime?.renderer?.contextName || null,
				gpu,
				hydrationState: runtime?.renderer?.hydrationState || null,
				renderDpr: runtime?.terrain?.stats?.renderDpr || null,
				renderScale: runtime?.terrain?.stats?.renderScale || null
			},
			runtimeError: runtime?.lastFrameError || document.documentElement.dataset.awtsmoosRuntimeError || null,
			target: target ? {
				alive: Boolean(target.alive),
				health: Number(target.health ?? target.profile?.health ?? 0),
				id: target.profile?.id || target.id || null,
				position: vector(target.group?.position)
			} : null,
			viewport: {
				innerHeight,
				innerWidth,
				visualHeight: visualViewport?.height || null,
				visualWidth: visualViewport?.width || null
			}
		};
		function vector(value) {
			return {
				x: Number(value?.x || 0),
				y: Number(value?.y || 0),
				z: Number(value?.z || 0)
			};
		}
	})()`;
}
