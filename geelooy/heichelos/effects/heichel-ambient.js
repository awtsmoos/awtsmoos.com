/* B"H
 * heichel-ambient.js — raw-WebGL ambient effects for heichel pages.
 *
 * Floating golden Hebrew-letter particles, soft god rays, and a subtle
 * animated cosmic background. Written as direct WebGL1 (no libraries, no
 * network, no build step) in the spirit of the Awtsmoos procedural core:
 * everything is seeded and deterministic, the public surface is tiny and
 * frozen, and generation is local-first.
 *
 * Usage (additive — no existing files need to change):
 *   <body data-heichel-ambient>
 *   <script src="effects/heichel-ambient.js"></script>
 * Or place a canvas yourself and the module adopts it:
 *   <canvas class="heichel-ambient-canvas"></canvas>
 *
 * Optional attributes on <body>:
 *   data-heichel-ambient="off"        — disable auto-init
 *   data-heichel-ambient-seed="gan"   — layout seed (default "heichel")
 *   data-heichel-ambient-bg="soft"    — "soft" (default, subtle cosmic bg)
 *                                        "transparent" (rays + letters only,
 *                                        page background shows through)
 *
 * Behavior:
 *   - canvas is position:fixed, inset 0, pointer-events none, inserted as the
 *     first child of <body> so page content paints above it
 *   - devicePixelRatio capped at 2
 *   - single rAF loop per instance; pauses when the tab is hidden
 *   - prefers-reduced-motion: renders exactly one static frame, no loop
 *   - mobile (max-width 480px): 90 particles instead of 240
 *   - per-frame CPU work is ~zero: drift, sway, rotation and twinkle all run
 *     in the vertex/fragment shaders; the loop only issues 2 draw calls
 *
 * Debug (for perf verification only, off by default):
 *   window.__HEICHEL_AMBIENT_DEBUG = true   // before load
 *   window.__heichelAmbient.instances[0].getStats()
 *     -> { frames, avgMs, p95Ms, maxMs }  (JS+submit ms per frame)
 */
(function () {
	'use strict';

	var VERSION = '1.0.0';

	/* ------------------------------------------------------------------ */
	/* deterministic PRNG (mulberry32) — same seed, same sky               */
	/* ------------------------------------------------------------------ */
	function xmur3(str) {
		var h = 1779033703 ^ str.length;
		for (var i = 0; i < str.length; i++) {
			h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
			h = (h << 13) | (h >>> 19);
		}
		return function () {
			h = Math.imul(h ^ (h >>> 16), 2246822507);
			h = Math.imul(h ^ (h >>> 13), 3266489909);
			return (h ^= h >>> 16) >>> 0;
		};
	}
	function mulberry32(a) {
		return function () {
			a |= 0; a = (a + 0x6D2B79F5) | 0;
			var t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}
	function makeRand(seedStr) {
		return mulberry32(xmur3(String(seedStr))());
	}

	/* ------------------------------------------------------------------ */
	/* Hebrew letter atlas — generated locally on an offscreen 2D canvas  */
	/* ------------------------------------------------------------------ */
	var LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'; // 22 letters
	var ATLAS_COLS = 8, ATLAS_ROWS = 3, CELL = 96;

	function buildAtlas() {
		var c = document.createElement('canvas');
		c.width = ATLAS_COLS * CELL; c.height = ATLAS_ROWS * CELL;
		var g = c.getContext('2d');
		g.clearRect(0, 0, c.width, c.height);
		g.textAlign = 'center';
		g.textBaseline = 'middle';
		for (var i = 0; i < LETTERS.length; i++) {
			var col = i % ATLAS_COLS, row = Math.floor(i / ATLAS_COLS);
			var cx = col * CELL + CELL / 2, cy = row * CELL + CELL / 2;
			var grad = g.createLinearGradient(0, cy - CELL * 0.32, 0, cy + CELL * 0.32);
			grad.addColorStop(0.0, '#fff3c4');
			grad.addColorStop(0.45, '#f7cf7d');
			grad.addColorStop(1.0, '#c08a34');
			g.font = '600 ' + Math.floor(CELL * 0.62) + 'px "Noto Serif Hebrew","David Libre",David,"FrankRuehl","Times New Roman",serif';
			g.shadowColor = 'rgba(255,196,110,0.85)';
			g.shadowBlur = CELL * 0.14;
			g.fillStyle = grad;
			g.fillText(LETTERS.charAt(i), cx, cy + CELL * 0.02);
		}
		g.shadowBlur = 0;
		return c;
	}

	/* ------------------------------------------------------------------ */
	/* shaders                                                             */
	/* ------------------------------------------------------------------ */
	var BG_VS = [
		'attribute vec2 aPos;',
		'varying vec2 vUv;',
		'void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }'
	].join('\n');

	var BG_FS = [
		'precision mediump float;',
		'varying vec2 vUv;',
		'uniform float uTime;',
		'uniform vec2 uRes;',
		'uniform float uSubtle;', // master intensity, 0..1
		'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
		'float noise(vec2 p){',
		'  vec2 i = floor(p), f = fract(p);',
		'  f = f * f * (3.0 - 2.0 * f);',
		'  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),',
		'             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);',
		'}',
		'void main(){',
		'  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);',
		'  float t = uTime * 0.02;',
		// deep cosmic base: near-black indigo, matches heichel #04040C theme
		'  vec3 col = mix(vec3(0.010, 0.012, 0.032), vec3(0.028, 0.034, 0.095), vUv.y);',
		// slow nebula — 2 octaves of value noise, very subtle
		'  float n = noise(p * 2.0 + vec2(t, -t * 0.7)) * 0.6',
		'          + noise(p * 4.7 - vec2(t * 0.6, t)) * 0.4;',
		'  vec3 neb = mix(vec3(0.045, 0.055, 0.150), vec3(0.095, 0.065, 0.095), n);',
		'  col += neb * (0.30 + 0.70 * n) * 0.38 * uSubtle;',
		// god rays: 3 soft additive beams from the top, slow sway
		'  float rays = 0.0;',
		'  for (int i = 0; i < 3; i++) {',
		'    float fi = float(i);',
		'    float cx = 0.28 + fi * 0.22 + sin(t * 3.0 + fi * 2.1) * 0.030;',
		'    float tilt = 0.16 + fi * 0.07;',
		'    float d = abs((p.x - (cx - 0.5)) + (p.y + 0.5) * tilt);',
		'    float w = 0.045 + fi * 0.020;',
		'    float beam = exp(-d * d / (w * w));',
		'    float fade = smoothstep(-0.50, 0.55, p.y) * smoothstep(0.55, -0.35, p.y);',
		'    rays += beam * fade * (0.55 - fi * 0.13);',
		'  }',
		'  col += vec3(1.0, 0.82, 0.52) * rays * 0.10 * uSubtle;',
		// vignette
		'  float vig = smoothstep(1.05, 0.35, length(p));',
		'  col *= mix(0.55, 1.0, vig);',
		'  gl_FragColor = vec4(col, 1.0);',
		'}'
	].join('\n');

	var PT_VS = [
		'attribute vec2 aCorner;', // -1..1 quad corner
		'attribute vec2 aBase;',   // NDC base position
		'attribute vec4 aSeed;',   // phase, driftSpeed, rotSpeed, twinkleSpeed
		'attribute vec4 aMisc;',   // halfSizePx, letterIdx, alpha, riseSpeed
		'uniform float uTime;',
		'uniform vec2 uRes;',
		'varying vec2 vUv;',
		'varying float vTwinkle;',
		'varying float vAlpha;',
		'void main(){',
		'  float t = uTime;',
		'  vec2 p = aBase;',
		// slow upward drift, wrapped in NDC
		'  p.y = mod(p.y + 1.0 + t * aMisc.w, 2.0) - 1.0;',
		// gentle horizontal sway
		'  p.x += sin(t * aSeed.y + aSeed.x * 6.2831) * 0.035;',
		// slow rotation
		'  float ang = aSeed.x * 6.2831 + t * aSeed.z;',
		'  float c = cos(ang), s = sin(ang);',
		'  vec2 corner = vec2(aCorner.x * c - aCorner.y * s,',
		'                     aCorner.x * s + aCorner.y * c);',
		'  vec2 ndc = p + corner * (aMisc.x / uRes) * 2.0;',
		'  gl_Position = vec4(ndc, 0.0, 1.0);',
		// atlas cell uv (8 cols x 3 rows); no Y-flip on upload, v=0 is canvas top
		'  float col = mod(aMisc.y, 8.0);',
		'  float row = floor(aMisc.y / 8.0);',
		'  vUv = (vec2(col, row)',
		'     + vec2(aCorner.x * 0.5 + 0.5, 0.5 - aCorner.y * 0.5)) / vec2(8.0, 3.0);',
		// twinkle 0.1..1.0
		'  vTwinkle = 0.55 + 0.45 * sin(t * aSeed.w + aSeed.x * 12.566);',
		'  vAlpha = aMisc.z;',
		'}'
	].join('\n');

	var PT_FS = [
		'precision mediump float;',
		'varying vec2 vUv;',
		'varying float vTwinkle;',
		'varying float vAlpha;',
		'uniform sampler2D uAtlas;',
		'void main(){',
		'  vec4 tex = texture2D(uAtlas, vUv);',
		'  vec3 gold = tex.rgb * vec3(1.0, 0.88, 0.60);',
		'  float a = tex.a * vTwinkle * vAlpha;',
		'  if (a < 0.003) discard;',
		'  gl_FragColor = vec4(gold, a);',
		'}'
	].join('\n');

	/* ------------------------------------------------------------------ */
	/* GL helpers                                                          */
	/* ------------------------------------------------------------------ */
	function compile(gl, type, src) {
		var s = gl.createShader(type);
		gl.shaderSource(s, src);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
			gl.deleteShader(s);
			return null;
		}
		return s;
	}
	function program(gl, vsSrc, fsSrc) {
		var vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
		var fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
		if (!vs || !fs) return null;
		var p = gl.createProgram();
		gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
		gl.deleteShader(vs); gl.deleteShader(fs);
		if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
			gl.deleteProgram(p);
			return null;
		}
		return p;
	}

	/* ------------------------------------------------------------------ */
	/* instance                                                            */
	/* ------------------------------------------------------------------ */
	var STATIC_T = 20.0; // deterministic time for the reduced-motion frame

	function Ambient(canvas, opts) {
		this.canvas = canvas;
		this.opts = opts || {};
		this.raf = 0;
		this.isAnimating = false;
		this.destroyed = false;
		this._frameTimes = [];
		this._onResize = this.resize.bind(this);
		this._onVis = this._visibility.bind(this);

		var bg = this.opts.background || 'soft';
		var ctxOpts = { alpha: bg !== 'soft', antialias: false, depth: false, stencil: false };
		try { ctxOpts.powerPreference = 'low-power'; } catch (e) { /* older browsers */ }
		var gl = canvas.getContext('webgl', ctxOpts) || canvas.getContext('experimental-webgl', ctxOpts);
		if (!gl) { this.failed = true; return; }
		this.gl = gl;

		var bgProg = program(gl, BG_VS, BG_FS);
		var ptProg = program(gl, PT_VS, PT_FS);
		if (!bgProg || !ptProg) { this.failed = true; return; }
		this.bgProg = bgProg; this.ptProg = ptProg;

		// fullscreen triangle
		var bgBuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		this.bgBuf = bgBuf;

		// letter particles (6 verts per quad, attributes duplicated)
		var rand = makeRand(this.opts.seed || 'heichel');
		var isMobile = false;
		try { isMobile = window.matchMedia('(max-width: 480px)').matches; } catch (e) {}
		var count = isMobile ? 90 : 240;
		this.particleCount = count;
		var corners = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
		var n = count * 6;
		var aCorner = new Float32Array(n * 2);
		var aBase = new Float32Array(n * 2);
		var aSeed = new Float32Array(n * 4);
		var aMisc = new Float32Array(n * 4);
		for (var i = 0; i < count; i++) {
			var bx = rand() * 2 - 1;
			var by = rand() * 2 - 1;
			var phase = rand();
			var driftSpeed = 0.05 + rand() * 0.12;          // sway Hz-ish
			var rotSpeed = (rand() - 0.5) * 0.25;           // rad/s, can be negative
			var twSpeed = 0.6 + rand() * 2.2;               // twinkle rad/s
			var half = 9 + rand() * 22;                     // half-size px @ dpr1
			var letterIdx = Math.floor(rand() * LETTERS.length);
			var alpha = 0.22 + rand() * 0.45;
			var rise = 0.008 + rand() * 0.022;               // NDC/s upward
			for (var k = 0; k < 6; k++) {
				var v = (i * 6 + k);
				aCorner[v * 2] = corners[k][0]; aCorner[v * 2 + 1] = corners[k][1];
				aBase[v * 2] = bx; aBase[v * 2 + 1] = by;
				aSeed[v * 4] = phase; aSeed[v * 4 + 1] = driftSpeed;
				aSeed[v * 4 + 2] = rotSpeed; aSeed[v * 4 + 3] = twSpeed;
				aMisc[v * 4] = half; aMisc[v * 4 + 1] = letterIdx;
				aMisc[v * 4 + 2] = alpha; aMisc[v * 4 + 3] = rise;
			}
		}
		function attrBuf(data, size) {
			var b = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, b);
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
			return { buf: b, size: size };
		}
		this.attrCorner = attrBuf(aCorner, 2);
		this.attrBase = attrBuf(aBase, 2);
		this.attrSeed = attrBuf(aSeed, 4);
		this.attrMisc = attrBuf(aMisc, 4);

		// atlas texture (WebGL1-safe: NPOT + clamp + linear, no mipmaps)
		var atlas = buildAtlas();
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		this.atlasTex = tex;

		// uniform locations
		this.uBg = {
			time: gl.getUniformLocation(bgProg, 'uTime'),
			res: gl.getUniformLocation(bgProg, 'uRes'),
			subtle: gl.getUniformLocation(bgProg, 'uSubtle')
		};
		this.uPt = {
			time: gl.getUniformLocation(ptProg, 'uTime'),
			res: gl.getUniformLocation(ptProg, 'uRes'),
			atlas: gl.getUniformLocation(ptProg, 'uAtlas')
		};
		this.aBgPos = gl.getAttribLocation(bgProg, 'aPos');
		this.aPt = {
			corner: gl.getAttribLocation(ptProg, 'aCorner'),
			base: gl.getAttribLocation(ptProg, 'aBase'),
			seed: gl.getAttribLocation(ptProg, 'aSeed'),
			misc: gl.getAttribLocation(ptProg, 'aMisc')
		};

		this.reducedMotion = false;
		try {
			this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		} catch (e) {}

		this.resize();
		window.addEventListener('resize', this._onResize);
		document.addEventListener('visibilitychange', this._onVis);

		if (this.reducedMotion) {
			this.draw(STATIC_T); // exactly one static frame, no loop
		} else {
			this.isAnimating = true;
			var self = this;
			var t0 = performance.now();
			var tick = function (now) {
				if (self.destroyed) return;
				self.raf = requestAnimationFrame(tick);
				if (document.hidden) return;
				var tStart = window.__HEICHEL_AMBIENT_DEBUG ? performance.now() : 0;
				self.draw((now - t0) / 1000);
				if (window.__HEICHEL_AMBIENT_DEBUG) {
					var dt = performance.now() - tStart;
					self._frameTimes.push(dt);
					if (self._frameTimes.length > 240) self._frameTimes.shift();
				}
			};
			this.raf = requestAnimationFrame(tick);
		}
	}

	Ambient.prototype.resize = function () {
		if (this.destroyed || this.failed) return;
		var dpr = 1;
		try { dpr = Math.min(window.devicePixelRatio || 1, 2); } catch (e) {}
		var w = this.canvas.clientWidth || window.innerWidth;
		var h = this.canvas.clientHeight || window.innerHeight;
		var bw = Math.max(1, Math.floor(w * dpr));
		var bh = Math.max(1, Math.floor(h * dpr));
		if (this.canvas.width !== bw || this.canvas.height !== bh) {
			this.canvas.width = bw; this.canvas.height = bh;
		}
		this.gl.viewport(0, 0, bw, bh);
		this._resW = bw; this._resH = bh;
	};

	Ambient.prototype._visibility = function () {
		// rAF already stops while hidden; nothing to do — time is absolute,
		// so there is no jump on return.
	};

	function bindAttr(gl, prog, attr, loc, info) {
		gl.bindBuffer(gl.ARRAY_BUFFER, info.buf);
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, info.size, gl.FLOAT, false, 0, 0);
	}

	Ambient.prototype.draw = function (t) {
		var gl = this.gl;
		if (!gl || this.failed) return;
		var bg = this.opts.background || 'soft';

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

		if (bg === 'soft') {
			gl.useProgram(this.bgProg);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.bgBuf);
			gl.enableVertexAttribArray(this.aBgPos);
			gl.vertexAttribPointer(this.aBgPos, 2, gl.FLOAT, false, 0, 0);
			gl.uniform1f(this.uBg.time, t);
			gl.uniform2f(this.uBg.res, this._resW, this._resH);
			gl.uniform1f(this.uBg.subtle, 1.0);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			gl.disableVertexAttribArray(this.aBgPos);
		} else {
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}

		gl.useProgram(this.ptProg);
		bindAttr(gl, this.ptProg, 'aCorner', this.aPt.corner, this.attrCorner);
		bindAttr(gl, this.ptProg, 'aBase', this.aPt.base, this.attrBase);
		bindAttr(gl, this.ptProg, 'aSeed', this.aPt.seed, this.attrSeed);
		bindAttr(gl, this.ptProg, 'aMisc', this.aPt.misc, this.attrMisc);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.atlasTex);
		gl.uniform1i(this.uPt.atlas, 0);
		gl.uniform1f(this.uPt.time, t);
		gl.uniform2f(this.uPt.res, this._resW, this._resH);
		gl.drawArrays(gl.TRIANGLES, 0, this.particleCount * 6);
		for (var k in this.aPt) gl.disableVertexAttribArray(this.aPt[k]);
	};

	Ambient.prototype.getStats = function () {
		var a = this._frameTimes.slice().sort(function (x, y) { return x - y; });
		if (!a.length) return { frames: 0, avgMs: 0, p95Ms: 0, maxMs: 0 };
		var sum = 0, i;
		for (i = 0; i < a.length; i++) sum += a[i];
		return {
			frames: a.length,
			avgMs: sum / a.length,
			p95Ms: a[Math.min(a.length - 1, Math.floor(a.length * 0.95))],
			maxMs: a[a.length - 1]
		};
	};

	Ambient.prototype.destroy = function () {
		this.destroyed = true;
		if (this.raf) cancelAnimationFrame(this.raf);
		window.removeEventListener('resize', this._onResize);
		document.removeEventListener('visibilitychange', this._onVis);
		try {
			var ext = this.gl && this.gl.getExtension('WEBGL_lose_context');
			if (ext) ext.loseContext();
		} catch (e) {}
		if (this._ownCanvas && this.canvas.parentNode) {
			this.canvas.parentNode.removeChild(this.canvas);
		}
	};

	/* ------------------------------------------------------------------ */
	/* public API + auto-init                                              */
	/* ------------------------------------------------------------------ */
	var instances = [];

	function styleCanvas(canvas) {
		var s = canvas.style;
		s.position = 'fixed';
		s.top = '0'; s.left = '0';
		s.width = '100vw'; s.height = '100vh';
		s.zIndex = '0';
		s.pointerEvents = 'none';
		s.margin = '0'; s.padding = '0'; s.border = '0';
		s.display = 'block';
	}

	function init(hostCanvas, opts) {
		opts = opts || {};
		var canvas = hostCanvas || document.createElement('canvas');
		var own = !hostCanvas;
		if (own) {
			canvas.className = 'heichel-ambient-canvas';
			styleCanvas(canvas);
			if (document.body) {
				if (document.body.firstChild) document.body.insertBefore(canvas, document.body.firstChild);
				else document.body.appendChild(canvas);
			}
		}
		var inst = new Ambient(canvas, opts);
		inst._ownCanvas = own;
		if (inst.failed) {
			if (own && canvas.parentNode) canvas.parentNode.removeChild(canvas);
			return null;
		}
		instances.push(inst);
		return inst;
	}

	function autoInit() {
		var body = document.body;
		if (!body) return;
		var val = body.getAttribute('data-heichel-ambient');
		var hasAttr = val !== null && val !== 'off' && val !== 'false';
		var host = document.querySelector('canvas.heichel-ambient-canvas');
		if (!hasAttr && !host) return;
		var opts = {
			seed: body.getAttribute('data-heichel-ambient-seed') || 'heichel',
			background: body.getAttribute('data-heichel-ambient-bg') || 'soft'
		};
		init(host || null, opts);
	}

	var api = {
		VERSION: VERSION,
		init: init,
		destroy: function (inst) {
			var i = instances.indexOf(inst);
			if (i >= 0) instances.splice(i, 1);
			if (inst) inst.destroy();
		},
		instances: instances
	};

	try {
		window.HeichelAmbient = api;
		window.__heichelAmbient = api;
	} catch (e) {}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', autoInit);
	} else {
		autoInit();
	}
})();
