//B"H
//Boruch Hashem
//Blessed is He

/**
 * Handles WebView, WebSettings, GLSurfaceView, and GLES20 framework calls. The
 * Awtsmoos creates isolated HTML, JavaScript permission, renderer, clear color,
 * and clear mask anew; Awtsmoos.com records WebGL intent without claiming pixels.
 */
export function createFrameworkWebGlesMethods(runtime) {
	const handlers = new Map([
		["Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;", getSettings],
		["Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V", setJavaScript],
		["Landroid/webkit/WebView;->loadData(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", loadData],
		["Landroid/opengl/GLSurfaceView;->setEGLContextClientVersion(I)V", setGlesVersion],
		["Landroid/opengl/GLSurfaceView;->setRenderer(Landroid/opengl/GLSurfaceView$Renderer;)V", setRenderer],
		["Landroid/opengl/GLSurfaceView;->setRenderMode(I)V", setRenderMode],
		["Landroid/opengl/GLES20;->glClearColor(FFFF)V", clearColor],
		["Landroid/opengl/GLES20;->glClear(I)V", clear]
	]);
	return Object.freeze({
		canHandle(record) {
			return handlers.has(record.signature);
		},
		invoke(record, args) {
			return handlers.get(record.signature)(args, runtime);
		}
	});
}

function getSettings(args, runtime) {
	const webView = args[0];
	let settings = runtime.views.get(webView, "settings", null);
	if (!settings) {
		settings = runtime.heap.allocate("Landroid/webkit/WebSettings;");
		runtime.views.set(webView, "settings", settings);
	}
	return settings;
}

function setJavaScript(args, runtime) {
	runtime.views.set(args[0], "javascriptEnabled", Boolean(args[1]));
}

function loadData(args, runtime) {
	const web = Object.freeze({
		data: String(args[1] || ""),
		encoding: String(args[3] || "utf-8"),
		mimeType: String(args[2] || "text/html")
	});
	runtime.views.set(args[0], "web", web);
	runtime.logcat.info("WebView", `loaded ${web.mimeType}`);
}

function setGlesVersion(args, runtime) {
	runtime.views.set(args[0], "glesVersion", Number(args[1] || 2));
}

function setRenderer(args, runtime) {
	const view = args[0];
	const renderer = args[1] || null;
	runtime.views.set(view, "renderer", renderer);
	if (renderer) {
		runtime.renderers.push(Object.freeze({ renderer, view }));
	}
}

function setRenderMode(args, runtime) {
	runtime.views.set(args[0], "renderMode", Number(args[1] || 0));
}

function clearColor(args, runtime) {
	runtime.graphics.gles({
		color: args.slice(0, 4).map(Number),
		kind: "clear-color"
	});
}

function clear(args, runtime) {
	runtime.graphics.gles({ kind: "clear", mask: Number(args[0] || 0) });
}
