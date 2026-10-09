// B"H
// VirtualGLSL.js — GLSL ES 1.00 compiler from absolute scratch.
//
// Pipeline: source text -> tokenizer -> recursive-descent parser -> AST ->
// structured IR (instruction lists) -> stack-machine interpreter with typed
// vector values. No host eval, no Function constructor, no dependencies.
//
// Supported subset (honest): float/int/bool, vec2/3/4, ivec/bvec, mat4,
// arrays (constant + dynamic index), uniforms/attributes/varyings,
// precision statements, user functions, if/else, for/while/do-while,
// break/continue/return/discard, ternary, constructors, swizzles (r-value
// and l-value), ~40 built-ins. Not supported: structs, samplers (declared
// but texture2D errors), mat2/mat3, preprocessor params, goto.
(function(root, factory) {
	if (typeof module === 'object' && module.exports) module.exports = factory();
	else { root.Merkava = root.Merkava || {}; Object.assign(root.Merkava, factory()); }
})(typeof self !== 'undefined' ? self : this, function() {
'use strict';

// ---------------------------------------------------------------------------
// 1. Tokenizer
// ---------------------------------------------------------------------------
const KEYWORDS = new Set(('attribute const uniform varying break continue do for while if else ' +
	'in out inout float int void bool true false lowp mediump highp precision ' +
	'invariant discard return mat2 mat3 mat4 vec2 vec3 vec4 ivec2 ivec3 ivec4 ' +
	'bvec2 bvec3 bvec4 sampler2D samplerCube struct').split(' '));

function tokenize(src) {
	const toks = [];
	let i = 0, line = 1;
	const n = src.length;
	while (i < n) {
		const c = src[i];
		if (c === '\n') { line++; i++; continue; }
		if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v') { i++; continue; }
		if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
		if (c === '/' && src[i + 1] === '*') {
			i += 2;
			while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
			i += 2; continue;
		}
		if (c === '#' ) {
			// preprocessor: skip whole line (defines handled in a pre-pass)
			while (i < n && src[i] !== '\n') i++;
			continue;
		}
		if (/[A-Za-z_]/.test(c)) {
			let j = i + 1;
			while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
			const w = src.slice(i, j);
			toks.push({ t: KEYWORDS.has(w) ? 'kw' : 'id', v: w, line });
			i = j; continue;
		}
		if (/[0-9.]/.test(c) && !(c === '.' && !/[0-9]/.test(src[i + 1] || ''))) {
			const m = /^[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(src.slice(i));
			if (m) {
				const raw = m[0];
				const isFloat = raw.includes('.') || /[eE]/.test(raw);
				toks.push({ t: isFloat ? 'float' : 'int', v: raw, line });
				i += raw.length; continue;
			}
		}
		const three = src.slice(i, i + 3), two = src.slice(i, i + 2);
		if (['<<=', '>>='].includes(three)) { toks.push({ t: 'op', v: three, line }); i += 3; continue; }
		if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '<<', '>>'].includes(two)) {
			toks.push({ t: 'op', v: two, line }); i += 2; continue;
		}
		if ('+-*/%=<>!&|^~?:;,.(){}[]'.includes(c)) { toks.push({ t: 'op', v: c, line }); i++; continue; }
		throw new Error('GLSL lex error at line ' + line + ': unexpected char ' + JSON.stringify(c));
	}
	toks.push({ t: 'eof', v: '', line });
	return toks;
}

// Simple object-like #define substitution (no params), applied before lexing.
function applyDefines(src) {
	const defines = new Map();
	const out = [];
	for (const rawLine of src.split('\n')) {
		const line = rawLine.trim();
		const m = /^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/.exec(line);
		if (m) { defines.set(m[1], m[2].trim()); continue; }
		if (/^#/.test(line)) continue; // drop other directives
		out.push(rawLine);
	}
	let text = out.join('\n');
	for (const [name, val] of defines) {
		text = text.replace(new RegExp('\\b' + name + '\\b', 'g'), '(' + val + ')');
	}
	return text;
}

// ---------------------------------------------------------------------------
// 2. Parser -> AST
// ---------------------------------------------------------------------------
const TYPE_NAMES = new Set(['void','float','int','bool','vec2','vec3','vec4','ivec2','ivec3','ivec4',
	'bvec2','bvec3','bvec4','mat2','mat3','mat4','sampler2D','samplerCube']);

function parse(src) {
	const toks = tokenize(applyDefines(src));
	let pos = 0;
	const peek = () => toks[pos];
	const next = () => toks[pos++];
	const err = msg => { throw new Error('GLSL parse error at line ' + peek().line + ': ' + msg + ' (near ' + JSON.stringify(peek().v) + ')'); };
	const expect = (t, v) => {
		const tk = peek();
		if (tk.t !== t || (v !== undefined && tk.v !== v)) err('expected ' + (v || t));
		return next();
	};
	const accept = (t, v) => {
		const tk = peek();
		if (tk.t === t && (v === undefined || tk.v === v)) { next(); return true; }
		return false;
	};

	function parseType() {
		const tk = peek();
		if ((tk.t === 'kw' || tk.t === 'id') && TYPE_NAMES.has(tk.v)) { next(); return tk.v; }
		err('expected type');
	}
	function parseStorage() {
		const tk = peek();
		if (tk.t === 'kw' && ['attribute','uniform','varying','const','in','out','inout'].includes(tk.v)) { next(); return tk.v; }
		return null;
	}
	function parsePrecision() {
		const tk = peek();
		if (tk.t === 'kw' && ['lowp','mediump','highp'].includes(tk.v)) { next(); return tk.v; }
		return null;
	}

	function parseExternalDecl() {
		// precision statement
		if (peek().t === 'kw' && peek().v === 'precision') {
			next(); parsePrecision(); parseType(); expect('op', ';');
			return { k: 'precision' };
		}
		if (peek().t === 'kw' && peek().v === 'invariant') {
			next(); // invariant varying x;
			parseStorage(); parseType();
			while (true) { expect('id'); if (!accept('op', ',')) break; }
			expect('op', ';');
			return { k: 'precision' };
		}
		const start = pos;
		const storage = parseStorage();
		const precision = parsePrecision();
		const type = parseType();
		if (peek().t === 'id' && toks[pos + 1] && toks[pos + 1].v === '(') {
			// function definition
			const name = next().v;
			expect('op', '(');
			const params = [];
			if (!accept('op', ')')) {
				do {
					const pstorage = parseStorage(); const pprec = parsePrecision(); const ptype = parseType();
					const pname = expect('id').v;
					params.push({ type: ptype, name: pname });
				} while (accept('op', ','));
				expect('op', ')');
			}
			const body = parseCompound();
			return { k: 'func', ret: type, name, params, body };
		}
		// global declaration(s)
		pos = start;
		return parseDeclaration(true);
	}

	function parseDeclaration(isGlobal) {
		const storage = parseStorage();
		const precision = parsePrecision();
		const type = parseType();
		if (type === 'struct') err('structs unsupported');
		if (['mat2','mat3'].includes(type)) err(type + ' unsupported (mat4 only)');
		const decls = [];
		do {
			const name = expect('id').v;
			let arrSize = null;
			if (accept('op', '[')) {
				const sz = parseExpr();
				if (sz.k !== 'int') err('array size must be constant int');
				arrSize = sz.v; expect('op', ']');
			}
			let init = null;
			if (accept('op', '=')) init = parseExpr();
			decls.push({ name, arrSize, init });
		} while (accept('op', ','));
		expect('op', ';');
		return { k: 'decl', storage, precision, type, decls, isGlobal: !!isGlobal };
	}

	function parseCompound() {
		expect('op', '{');
		const body = [];
		while (!accept('op', '}')) body.push(parseStatement());
		return { k: 'block', body };
	}

	function parseStatement() {
		const tk = peek();
		if (tk.t === 'op' && tk.v === '{') return parseCompound();
		if (tk.t === 'op' && tk.v === ';') { next(); return { k: 'empty' }; }
		if (tk.t === 'kw' && tk.v === 'if') {
			next(); expect('op', '('); const cond = parseExpr(); expect('op', ')');
			const then = parseStatement();
			let els = null;
			if (peek().t === 'kw' && peek().v === 'else') { next(); els = parseStatement(); }
			return { k: 'if', cond, then, els };
		}
		if (tk.t === 'kw' && tk.v === 'for') {
			next(); expect('op', '(');
			let init = null;
			if (!(peek().t === 'op' && peek().v === ';')) {
				const sp = pos;
				try { init = parseDeclaration(false); }
				catch (e) { pos = sp; init = { k: 'expr', expr: parseExpr() }; expect('op', ';'); }
			} else next();
			let cond = null;
			if (!(peek().t === 'op' && peek().v === ';')) cond = parseExpr();
			expect('op', ';');
			let incr = null;
			if (!(peek().t === 'op' && peek().v === ')')) incr = parseExpr();
			expect('op', ')');
			const body = parseStatement();
			return { k: 'for', init, cond, incr, body };
		}
		if (tk.t === 'kw' && tk.v === 'while') {
			next(); expect('op', '('); const cond = parseExpr(); expect('op', ')');
			return { k: 'while', cond, body: parseStatement() };
		}
		if (tk.t === 'kw' && tk.v === 'do') {
			next(); const body = parseStatement();
			expect('kw', 'while'); expect('op', '('); const cond = parseExpr(); expect('op', ')'); expect('op', ';');
			return { k: 'dowhile', cond, body };
		}
		if (tk.t === 'kw' && (tk.v === 'return' || tk.v === 'discard' || tk.v === 'break' || tk.v === 'continue')) {
			next();
			if (tk.v === 'return' && !(peek().t === 'op' && peek().v === ';')) {
				const expr = parseExpr(); expect('op', ';'); return { k: 'return', expr };
			}
			expect('op', ';'); return { k: tk.v };
		}
		// declaration or expression statement: lookahead
		const sp = pos;
		const maybeStorage = (peek().t === 'kw' && ['const'].includes(peek().v));
		if (maybeStorage || ((peek().t === 'kw' || peek().t === 'id') && TYPE_NAMES.has(peek().v))) {
			try { return parseDeclaration(false); } catch (e) { pos = sp; }
		}
		const expr = parseExpr(); expect('op', ';');
		return { k: 'expr', expr };
	}

	// ---- expressions (precedence climbing) ----
	function parseExpr() { return parseAssign(); }
	function parseAssign() {
		const lhs = parseTernary();
		const tk = peek();
		if (tk.t === 'op' && ['=','+=','-=','*=','/=','%='].includes(tk.v)) {
			next();
			const rhs = parseAssign();
			return { k: 'assign', op: tk.v, lhs, rhs };
		}
		return lhs;
	}
	function parseTernary() {
		const cond = parseOr();
		if (accept('op', '?')) {
			const a = parseExpr(); expect('op', ':'); const b = parseTernary();
			return { k: 'tern', cond, a, b };
		}
		return cond;
	}
	function parseOr() { return binLeft(parseAnd, ['||']); }
	function parseAnd() { return binLeft(parseEq, ['&&']); }
	function parseEq() { return binLeft(parseRel, ['==', '!=']); }
	function parseRel() { return binLeft(parseAdd, ['<', '>', '<=', '>=']); }
	function parseAdd() { return binLeft(parseMul, ['+', '-']); }
	function parseMul() { return binLeft(parseUnary, ['*', '/', '%']); }
	function binLeft(sub, ops) {
		let lhs = sub();
		while (peek().t === 'op' && ops.includes(peek().v)) {
			const op = next().v;
			lhs = { k: 'bin', op, lhs, rhs: sub() };
		}
		return lhs;
	}
	function parseUnary() {
		const tk = peek();
		if (tk.t === 'op' && ['-','+','!','~'].includes(tk.v)) { next(); return { k: 'un', op: tk.v, expr: parseUnary() }; }
		if (tk.t === 'op' && ['++','--'].includes(tk.v)) { next(); return { k: 'preinc', op: tk.v, expr: parseUnary() }; }
		return parsePostfix();
	}
	function parsePostfix() {
		let expr = parsePrimary();
		for (;;) {
			if (accept('op', '(')) {
				const args = [];
				if (!accept('op', ')')) { do { args.push(parseAssign()); } while (accept('op', ',')); expect('op', ')'); }
				expr = { k: 'call', callee: expr, args };
			} else if (accept('op', '[')) {
				const idx = parseExpr(); expect('op', ']');
				expr = { k: 'index', obj: expr, idx };
			} else if (accept('op', '.')) {
				const field = expect('id').v;
				expr = { k: 'field', obj: expr, field };
			} else if (peek().t === 'op' && ['++','--'].includes(peek().v)) {
				expr = { k: 'postinc', op: next().v, expr };
			} else break;
		}
		return expr;
	}
	function parsePrimary() {
		const tk = peek();
		if (tk.t === 'float') { next(); return { k: 'float', v: parseFloat(tk.v) }; }
		if (tk.t === 'int') { next(); return { k: 'int', v: parseInt(tk.v, 10) }; }
		if (tk.t === 'kw' && (tk.v === 'true' || tk.v === 'false')) { next(); return { k: 'bool', v: tk.v === 'true' }; }
		if (tk.t === 'id' || (tk.t === 'kw' && TYPE_NAMES.has(tk.v))) { next(); return { k: 'id', name: tk.v }; }
		if (tk.t === 'op' && tk.v === '(') { next(); const e = parseExpr(); expect('op', ')'); return e; }
		err('expected expression');
	}

	const decls = [];
	while (peek().t !== 'eof') decls.push(parseExternalDecl());
	return { k: 'unit', decls };
}

// ---------------------------------------------------------------------------
// 3. Values
// ---------------------------------------------------------------------------
function F(v) { return { t: 'f', v: +v }; }
function I(v) { return { t: 'i', v: Math.trunc(+v) }; }
function B(v) { return { t: 'b', v: !!v }; }
function V(n, arr) { return { t: 'v', n, v: arr.map(Number) }; }
function BV(n, arr) { return { t: 'bv', n, v: arr.map(x => !!x) }; }
function M4(arr) { return { t: 'm', n: 4, v: arr.map(Number) }; }
function ARR(elem, arr) { return { t: 'arr', elem, v: arr.slice() }; }

function isScalar(x) { return x.t === 'f' || x.t === 'i' || x.t === 'b'; }
function toFloat(x) { return isScalar(x) ? +x.v : NaN; }
function truthy(x) {
	if (x.t === 'b') return x.v;
	if (x.t === 'f' || x.t === 'i') return x.v !== 0;
	throw new Error('GLSL runtime: non-scalar in condition');
}
function vecN(x) {
	if (x.t === 'v') return x;
	if (isScalar(x)) return null;
	throw new Error('GLSL runtime: expected vector');
}
function promote(a, b) {
	// int -> float promotion for mixed arithmetic
	if ((a.t === 'i' && b.t === 'f') || (a.t === 'f' && b.t === 'i')) {
		return [a.t === 'i' ? F(a.v) : a, b.t === 'i' ? F(b.v) : b];
	}
	return [a, b];
}

// ---------------------------------------------------------------------------
// 4. Built-in functions
// ---------------------------------------------------------------------------
function map1(fn, x) {
	if (x.t === 'v') return V(x.n, x.v.map(fn));
	return F(fn(toFloat(x)));
}
function zip2(fn, a, b) {
	[a, b] = promote(a, b);
	if (a.t === 'v' && b.t === 'v' && a.n === b.n) return V(a.n, a.v.map((v, i) => fn(v, b.v[i])));
	if (a.t === 'v' && isScalar(b)) return V(a.n, a.v.map(v => fn(v, toFloat(b))));
	if (isScalar(a) && b.t === 'v') return V(b.n, b.v.map(v => fn(toFloat(a), v)));
	if (isScalar(a) && isScalar(b)) return F(fn(toFloat(a), toFloat(b)));
	throw new Error('GLSL runtime: type mismatch in builtin');
}
function zip3(fn, a, b, c) {
	// mix(a,b,t): component-wise; broadcast scalars
	const n = a.t === 'v' ? a.n : (b.t === 'v' ? b.n : (c.t === 'v' ? c.n : 0));
	const ga = i => a.t === 'v' ? a.v[i] : toFloat(a);
	const gb = i => b.t === 'v' ? b.v[i] : toFloat(b);
	const gc = i => c.t === 'v' ? c.v[i] : toFloat(c);
	if (!n) return F(fn(toFloat(a), toFloat(b), toFloat(c)));
	return V(n, Array.from({ length: n }, (_, i) => fn(ga(i), gb(i), gc(i))));
}

const BUILTINS = {
	radians: a => map1(x => x * Math.PI / 180, a),
	degrees: a => map1(x => x * 180 / Math.PI, a),
	sin: a => map1(Math.sin, a), cos: a => map1(Math.cos, a), tan: a => map1(Math.tan, a),
	asin: a => map1(Math.asin, a), acos: a => map1(Math.acos, a),
	atan: (a, b) => b === undefined ? map1(Math.atan, a) : zip2((x, y) => Math.atan2(x, y), a, b),
	pow: (a, b) => zip2(Math.pow, a, b),
	exp: a => map1(Math.exp, a), log: a => map1(Math.log, a),
	exp2: a => map1(x => Math.pow(2, x), a), log2: a => map1(x => Math.log2(x), a),
	sqrt: a => map1(Math.sqrt, a), inversesqrt: a => map1(x => 1 / Math.sqrt(x), a),
	abs: a => { if (a.t === 'v') return V(a.n, a.v.map(Math.abs)); if (a.t === 'i') return I(Math.abs(a.v)); return F(Math.abs(toFloat(a))); },
	sign: a => map1(x => x > 0 ? 1 : x < 0 ? -1 : 0, a),
	floor: a => map1(Math.floor, a), ceil: a => map1(Math.ceil, a),
	fract: a => map1(x => x - Math.floor(x), a),
	mod: (a, b) => zip2((x, y) => x - y * Math.floor(x / y), a, b),
	min: (a, b) => zip2(Math.min, a, b), max: (a, b) => zip2(Math.max, a, b),
	clamp: (a, lo, hi) => zip3((x, l, h) => Math.min(Math.max(x, l), h), a, lo, hi),
	mix: (a, b, t) => zip3((x, y, tt) => x * (1 - tt) + y * tt, a, b, t),
	step: (e, x) => zip2((ee, xx) => xx < ee ? 0 : 1, e, x),
	smoothstep: (e0, e1, x) => zip3((a, b, xx) => {
		const t = Math.min(Math.max((xx - a) / (b - a), 0), 1);
		return t * t * (3 - 2 * t);
	}, e0, e1, x),
	length: a => F(Math.sqrt(a.v.reduce((s, v) => s + v * v, 0))),
	distance: (a, b) => { const d = zip2((x, y) => x - y, a, b); return F(Math.sqrt(d.v.reduce((s, v) => s + v * v, 0))); },
	dot: (a, b) => F(a.v.reduce((s, v, i) => s + v * b.v[i], 0)),
	cross: (a, b) => V(3, [
		a.v[1] * b.v[2] - a.v[2] * b.v[1],
		a.v[2] * b.v[0] - a.v[0] * b.v[2],
		a.v[0] * b.v[1] - a.v[1] * b.v[0]]),
	normalize: a => { const l = Math.sqrt(a.v.reduce((s, v) => s + v * v, 0)) || 1; return V(a.n, a.v.map(v => v / l)); },
	faceforward: (n, i, nr) => zip2((nn, ii) => (nn * ii < 0 ? nn : -nn), n, i),
	reflect: (i, n) => { const d = 2 * i.v.reduce((s, v, k) => s + v * n.v[k], 0); return V(i.n, i.v.map((v, k) => v - d * n.v[k])); },
	refract: (i, n, eta) => {
		const e = toFloat(eta);
		const d = i.v.reduce((s, v, k) => s + v * n.v[k], 0);
		const k = 1 - e * e * (1 - d * d);
		if (k < 0) return V(i.n, i.v.map(() => 0));
		return V(i.n, i.v.map((v, kk) => e * v - (e * d + Math.sqrt(k)) * n.v[kk]));
	},
	matrixCompMult: (a, b) => M4(a.v.map((v, i) => v * b.v[i])),
	outerProduct: (c, r) => M4(Array.from({ length: 16 }, (_, i) => c.v[i % 4] * r.v[(i / 4) | 0])),
	transpose: m => M4(Array.from({ length: 16 }, (_, i) => m.v[(i % 4) * 4 + ((i / 4) | 0)])),
	lessThan: (a, b) => BV(a.n, a.v.map((v, i) => v < b.v[i])),
	lessThanEqual: (a, b) => BV(a.n, a.v.map((v, i) => v <= b.v[i])),
	greaterThan: (a, b) => BV(a.n, a.v.map((v, i) => v > b.v[i])),
	greaterThanEqual: (a, b) => BV(a.n, a.v.map((v, i) => v >= b.v[i])),
	equal: (a, b) => a.t === 'v' ? BV(a.n, a.v.map((v, i) => v === b.v[i])) : B(a.v === b.v),
	notEqual: (a, b) => a.t === 'v' ? BV(a.n, a.v.map((v, i) => v !== b.v[i])) : B(a.v !== b.v),
	any: a => B(a.v.some(Boolean)), all: a => B(a.v.every(Boolean)),
	not: a => a.t === 'bv' ? BV(a.n, a.v.map(v => !v)) : B(!truthy(a)),
	texture2D: () => { throw new Error('GLSL runtime: texture2D unsupported (no sampler lowering yet)'); },
	textureCube: () => { throw new Error('GLSL runtime: textureCube unsupported'); },
};

// ---------------------------------------------------------------------------
// 5. Compiler: AST -> structured IR
// ---------------------------------------------------------------------------
// IR instr forms (arrays):
//  ['pushc', value] ['load', name] ['store', name]
//  ['add'|'sub'|'mul'|'div'|'mod'|'lt'|'gt'|'le'|'ge'|'eq'|'ne'|'and'|'or'|'neg'|'not']
//  ['vec', n] ['mat4'] ['swiz', mask] ['index'] ['matvec'] ['matvecL'] (vec*mat)
//  ['call', name, argc] ['tern']
//  ['decl', name, hasInit]          -- declares local (init value on stack if hasInit)
//  ['if', condI, thenI, elseI] ['while', condI, bodyI] ['for', initI, condI, incrI, bodyI]
//  ['break'] ['continue'] ['return', exprI|null] ['discard']
//  ['storeSwiz', name, mask] ['storeIndex', name]  -- l-value stores
//  ['declArr', name, size, elem]

const SWIZZLE_CHARS = { x: 0, y: 1, z: 2, w: 3, r: 0, g: 1, b: 2, a: 3, s: 0, t: 1, p: 2, q: 3 };

function compileGLSL(source, stage) {
	const errors = [];
	try {
		const ast = parse(source);
		const c = new Compiler(stage, errors);
		const ir = c.compileUnit(ast);
		if (errors.length) return { ok: false, errors, log: errors.join('\n') };
		return {
			ok: true, errors: [],
			ir,
			functions: c.functions,
			attributes: c.attributes,
			uniforms: c.uniforms,
			varyings: c.varyings,
			log: ''
		};
	} catch (e) {
		errors.push(e.message);
		return { ok: false, errors, log: errors.join('\n') };
	}
}

class Compiler {
	constructor(stage, errors) {
		this.stage = stage; // 'vertex' | 'fragment'
		this.errors = errors;
		this.attributes = []; // {type, name}
		this.uniforms = [];
		this.varyings = [];
		this.functions = new Map(); // name -> {params, body}
		this.globalInits = [];
	}
	compileUnit(ast) {
		const main = [];
		for (const d of ast.decls) {
			if (d.k === 'precision') continue;
			if (d.k === 'func') {
				if (this.functions.has(d.name)) this.errors.push('duplicate function ' + d.name);
				this.functions.set(d.name, { ret: d.ret, params: d.params, body: this.compileBlock(d.body) });
				continue;
			}
			if (d.k === 'decl') this.compileGlobalDecl(d, main);
		}
		if (!this.functions.has('main')) this.errors.push('missing void main()');
		return main;
	}
	compileGlobalDecl(d, out) {
		for (const one of d.decls) {
			const rec = { type: d.type, name: one.name };
			if (d.storage === 'attribute') {
				if (this.stage !== 'vertex') this.errors.push('attribute in fragment shader');
				this.attributes.push(rec);
			} else if (d.storage === 'uniform') this.uniforms.push(rec);
			else if (d.storage === 'varying') this.varyings.push(rec);
			else if (d.storage === 'const' || !d.storage) {
				// global var with optional init -> run inits before main
				if (one.init) { this.globalInits.push(...this.compileExpr(one.init), ['store', one.name]); }
				else this.globalInits.push(['pushc', zeroOf(d.type)], ['store', one.name]);
				this.globals = this.globals || new Set();
				this.globals.add(one.name + ':' + d.type);
			}
			if (one.arrSize && (d.storage === 'attribute' || d.storage === 'varying'))
				this.errors.push(d.storage + ' arrays unsupported: ' + one.name);
		}
	}
	// ---- statements ----
	compileBlock(b) {
		const out = [];
		for (const s of b.body) out.push(...this.compileStmt(s));
		return out;
	}
	compileStmt(s) {
		switch (s.k) {
			case 'empty': return [];
			case 'block': return this.compileBlock(s);
			case 'expr': return [...this.compileExpr(s.expr), ['pop']];
			case 'decl': {
				const out = [];
				for (const one of s.decls) {
					if (one.arrSize) {
						if (one.init) this.errors.push('array initializer unsupported: ' + one.name);
						out.push(['declArr', one.name, one.arrSize, s.type]);
					} else {
						if (one.init) out.push(...this.compileExpr(one.init));
						else out.push(['pushc', zeroOf(s.type)]);
						out.push(['decl', one.name]);
					}
				}
				return out;
			}
			case 'if':
				return [['if', this.compileExpr(s.cond), this.compileStmt(s.then),
					s.els ? this.compileStmt(s.els) : []]];
			case 'while':
				return [['while', this.compileExpr(s.cond), this.compileStmt(s.body)]];
			case 'dowhile':
				return [['dowhile', this.compileExpr(s.cond), this.compileStmt(s.body)]];
			case 'for': {
				const init = s.init ? (s.init.k === 'decl' ? this.compileStmt(s.init)
					: [...this.compileExpr(s.init.expr), ['pop']]) : [];
				const cond = s.cond ? this.compileExpr(s.cond) : [['pushc', B(true)]];
				const incr = s.incr ? [...this.compileExpr(s.incr), ['pop']] : [];
				return [['for', init, cond, incr, this.compileStmt(s.body)]];
			}
			case 'return':
				return [['return', s.expr ? this.compileExpr(s.expr) : null]];
			case 'break': return [['break']];
			case 'continue': return [['continue']];
			case 'discard': return [['discard']];
			default: this.errors.push('unsupported statement ' + s.k); return [];
		}
	}
	// ---- expressions -> flat stack instrs ----
	compileExpr(e) {
		switch (e.k) {
			case 'float': return [['pushc', F(e.v)]];
			case 'int': return [['pushc', I(e.v)]];
			case 'bool': return [['pushc', B(e.v)]];
			case 'id': return [['load', e.name]];
			case 'bin': {
				const L = this.compileExpr(e.lhs), R = this.compileExpr(e.rhs);
				const op = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '%': 'mod',
					'<': 'lt', '>': 'gt', '<=': 'le', '>=': 'ge', '==': 'eq', '!=': 'ne',
					'&&': 'and', '||': 'or' }[e.op];
				if (!op) { this.errors.push('unsupported binary op ' + e.op); return []; }
				return [...L, ...R, [op]];
			}
			case 'un': {
				const X = this.compileExpr(e.expr);
				if (e.op === '-') return [...X, ['neg']];
				if (e.op === '!') return [...X, ['not']];
				if (e.op === '+') return X;
				this.errors.push('unsupported unary ' + e.op); return X;
			}
			case 'tern': {
				const C = this.compileExpr(e.cond), A = this.compileExpr(e.a), B2 = this.compileExpr(e.b);
				return [...C, ...A, ...B2, ['tern']];
			}
			case 'assign': {
				const R = this.compileExpr(e.rhs);
				if (e.op !== '=') {
					// desugar op= : load lhs, apply, store
					const L = this.compileLValue(e.lhs);
					const op = { '+=': 'add', '-=': 'sub', '*=': 'mul', '/=': 'div', '%=': 'mod' }[e.op];
					return [...L.load, ...R, [op], ...L.store];
				}
				const L = this.compileLValue(e.lhs);
				return [...R, ...L.store];
			}
			case 'preinc': case 'postinc': {
				const L = this.compileLValue(e.expr);
				const delta = e.op === '++' ? 1 : -1;
				if (e.k === 'preinc')
					return [...L.load, ['pushc', F(delta)], ['add'], ...L.storeDup];
				return [...L.load, ...L.load, ['pushc', F(delta)], ['add'], ...L.store, ['pop2keep1']];
			}
			case 'call': {
				// constructor or function call
				if (e.callee.k === 'id' && isTypeName(e.callee.name)) {
					const t = e.callee.name;
					const argI = [];
					for (const a of e.args) argI.push(...this.compileExpr(a));
					return [...argI, ['construct', t, e.args.length]];
				}
				if (e.callee.k === 'id') {
					const argI = [];
					for (const a of e.args) argI.push(...this.compileExpr(a));
					return [...argI, ['call', e.callee.name, e.args.length]];
				}
				this.errors.push('unsupported callee'); return [];
			}
			case 'field': {
				const O = this.compileExpr(e.obj);
				if (!/^[xyzwrgba stpq]+$/.test(e.field) || e.field.length > 4) {
					this.errors.push('bad swizzle .' + e.field); return O;
				}
				return [...O, ['swiz', e.field]];
			}
			case 'index': {
				const O = this.compileExpr(e.obj), IX = this.compileExpr(e.idx);
				return [...O, ...IX, ['index']];
			}
			default: this.errors.push('unsupported expr ' + e.k); return [['pushc', F(0)]];
		}
	}
	compileLValue(e) {
		// returns {load:[...], store:[...], storeDup:[...]} (storeDup leaves value on stack)
		if (e.k === 'id') {
			return { load: [['load', e.name]], store: [['store', e.name]], storeDup: [['storeDup', e.name]] };
		}
		if (e.k === 'field') {
			const O = this.compileExpr(e.obj);
			if (e.obj.k !== 'id') { this.errors.push('swizzle store on non-identifier'); return { load: O, store: [], storeDup: [] }; }
			return {
				load: O, store: [['storeSwiz', e.obj.name, e.field]],
				storeDup: [['storeSwizDup', e.obj.name, e.field]]
			};
		}
		if (e.k === 'index') {
			const O = this.compileExpr(e.obj), IX = this.compileExpr(e.idx);
			if (e.obj.k !== 'id') { this.errors.push('index store on non-identifier'); return { load: [...O, ...IX, ['index']], store: [], storeDup: [] }; }
			return {
				load: [...O, ...IX, ['index']],
				store: [...IX, ['storeIndex', e.obj.name]],
				storeDup: [['storeIndexDup', e.obj.name]]
			};
		}
		this.errors.push('bad l-value'); return { load: [], store: [], storeDup: [] };
	}
}

function isTypeName(n) {
	return ['float','int','bool','vec2','vec3','vec4','ivec2','ivec3','ivec4',
		'bvec2','bvec3','bvec4','mat2','mat3','mat4'].includes(n);
}
function zeroOf(type) {
	switch (type) {
		case 'float': return F(0); case 'int': return I(0); case 'bool': return B(false);
		case 'vec2': return V(2, [0, 0]); case 'vec3': return V(3, [0, 0, 0]);
		case 'vec4': return V(4, [0, 0, 0, 0]);
		case 'mat4': return M4([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		default: return F(0);
	}
}

// ---------------------------------------------------------------------------
// 6. Interpreter
// ---------------------------------------------------------------------------
const LOOP_GUARD = 100000;

class Runner {
	constructor(program, builtins) {
		this.program = program; // {ir, functions, ...}
		this.builtins = builtins || BUILTINS;
		this.guard = 0;
	}
	run(entryInputs) {
		// entryInputs: {attribs:{}, uniforms:{}, varyings:{}, fragCoord, globals}
		const env = {
			vars: new Map(), parent: null,
			attribs: entryInputs.attribs || {},
			uniforms: entryInputs.uniforms || {},
			varyings: entryInputs.varyings || {},
			varyingNames: entryInputs.varyingNames || new Set(),
			out: {}, discard: false,
			fragCoord: entryInputs.fragCoord || null,
			loopDepth: 0,
		};
		// seed globals
		for (const [k, v] of Object.entries(entryInputs.globals || {})) env.vars.set(k, v);
		const stack = [];
		const sig = this.execList(this.program.ir, env, stack);
		return { env, stack, signal: sig };
	}
	lookup(env, name) {
		// locals -> attribs/uniforms/varyings/outputs/builtins-as-values
		let e = env;
		while (e) { if (e.vars.has(name)) return e.vars.get(name); e = e.parent; }
		if (name in env.attribs) return env.attribs[name];
		if (name in env.uniforms) return env.uniforms[name];
		if (name in env.varyings) return env.varyings[name];
		if (name in env.out) return env.out[name];
		if (name === 'gl_FragCoord' && env.fragCoord) return env.fragCoord;
		throw new Error('GLSL runtime: undeclared identifier ' + name);
	}
	assign(env, name, val) {
		let e = env;
		while (e) { if (e.vars.has(name)) { e.vars.set(name, val); return; } e = e.parent; }
		if (name in env.out || name === 'gl_Position' || name === 'gl_FragColor' || name === 'gl_FragData' || name === 'gl_PointSize') {
			env.out[name] = val; return;
		}
		if (env.varyingNames && env.varyingNames.has(name)) { env.varyings[name] = val; return; }
		if (name in env.varyings) { env.varyings[name] = val; return; }
		// implicit global/lazy declare (for compiler-emitted stores)
		env.vars.set(name, val);
	}
	execList(list, env, stack) {
		for (const ins of list) {
			if (++this.guard > LOOP_GUARD) throw new Error('GLSL runtime: loop guard tripped');
			const sig = this.execOne(ins, env, stack);
			if (sig) return sig; // 'break' | 'continue' | {return:v} | {discard:true}
		}
		return null;
	}
	execOne(ins, env, stack) {
		const op = ins[0];
		switch (op) {
			case 'pushc': stack.push(ins[1]); return null;
			case 'pop': stack.pop(); return null;
			case 'pop2keep1': { const a = stack.pop(); stack.pop(); stack.push(a); return null; }
			case 'load': stack.push(this.lookup(env, ins[1])); return null;
			case 'store': this.assign(env, ins[1], stack.pop()); return null;
			case 'storeDup': { const v = stack[stack.length - 1]; this.assign(env, ins[1], v); return null; }
			case 'decl': { const v = stack.pop(); env.vars.set(ins[1], v); return null; }
			case 'declArr': { env.vars.set(ins[1], ARR(ins[3], new Array(ins[2]).fill(null).map(() => zeroOf(ins[3])))); return null; }
			case 'storeSwiz': {
				const v = stack.pop();
				const cur = this.lookup(env, ins[1]);
				stack.push(applySwizzleStore(cur, ins[2], v));
				this.assign(env, ins[1], stack.pop());
				return null;
			}
			case 'storeSwizDup': {
				const v = stack[stack.length - 1];
				const cur = this.lookup(env, ins[1]);
				this.assign(env, ins[1], applySwizzleStore(cur, ins[2], v));
				return null;
			}
			case 'storeIndex': {
				const idx = Math.trunc(toFloat(stack.pop()));
				const v = stack.pop();
				const cur = this.lookup(env, ins[1]);
				this.assign(env, ins[1], applyIndexStore(cur, idx, v));
				return null;
			}
			case 'storeIndexDup': {
				const v = stack[stack.length - 1];
				const idx = Math.trunc(toFloat(stack.pop()));
				const cur = this.lookup(env, ins[1]);
				this.assign(env, ins[1], applyIndexStore(cur, idx, v));
				return null;
			}
			case 'add': case 'sub': case 'mul': case 'div': case 'mod': {
				const b = stack.pop(), a = stack.pop();
				stack.push(arith(op, a, b)); return null;
			}
			case 'lt': case 'gt': case 'le': case 'ge': case 'eq': case 'ne': {
				const b = stack.pop(), a = stack.pop();
				stack.push(cmp(op, a, b)); return null;
			}
			case 'and': case 'or': {
				const b = stack.pop(), a = stack.pop();
				stack.push(B(op === 'and' ? truthy(a) && truthy(b) : truthy(a) || truthy(b)));
				return null;
			}
			case 'neg': stack.push(arith('sub', F(0), stack.pop())); return null;
			case 'not': { const a = stack.pop(); stack.push(a.t === 'bv' ? BV(a.n, a.v.map(v => !v)) : B(!truthy(a))); return null; }
			case 'tern': {
				const b = stack.pop(), a = stack.pop(), c = stack.pop();
				stack.push(truthy(c) ? a : b); return null;
			}
			case 'vec': {
				const n = ins[1], args = [];
				for (let i = 0; i < n; i++) args.unshift(stack.pop());
				stack.push(makeVec(n, args)); return null;
			}
			case 'construct': return this.execConstruct(ins, stack);
			case 'swiz': stack.push(applySwizzle(stack.pop(), ins[1])); return null;
			case 'index': {
				const idx = Math.trunc(toFloat(stack.pop()));
				const o = stack.pop();
				stack.push(indexValue(o, idx)); return null;
			}
			case 'call': {
				const args = [];
				for (let i = 0; i < ins[2]; i++) args.unshift(stack.pop());
				stack.push(this.callFn(ins[1], args, env)); return null;
			}
			case 'if': {
				this.execList(ins[1], env, stack);
				const c = stack.pop();
				const sig = truthy(c) ? this.execList(ins[2], env, stack)
					: (ins[3].length ? this.execList(ins[3], env, stack) : null);
				if (sig === 'break' || sig === 'continue' || (sig && (sig.return || sig.discard))) return sig;
				return null;
			}
			case 'while': {
				env.loopDepth++;
				try {
					for (;;) {
						this.execList(ins[1], env, stack);
						if (!truthy(stack.pop())) break;
						const sig = this.execList(ins[2], env, stack);
						if (sig === 'break') break;
						if (sig === 'continue') continue;
						if (sig) return sig;
					}
				} finally { env.loopDepth--; }
				return null;
			}
			case 'dowhile': {
				env.loopDepth++;
				try {
					for (;;) {
						const sig = this.execList(ins[2], env, stack);
						if (sig === 'break') break;
						if (sig === 'continue') { /* fall to cond */ }
						else if (sig) return sig;
						this.execList(ins[1], env, stack);
						if (!truthy(stack.pop())) break;
					}
				} finally { env.loopDepth--; }
				return null;
			}
			case 'for': {
				env.loopDepth++;
				try {
					this.execList(ins[1], env, stack);
					for (;;) {
						this.execList(ins[2], env, stack);
						if (!truthy(stack.pop())) break;
						const sig = this.execList(ins[4], env, stack);
						if (sig === 'break') break;
						if (sig && sig !== 'continue') return sig;
						this.execList(ins[3], env, stack);
					}
				} finally { env.loopDepth--; }
				return null;
			}
			case 'break': return 'break';
			case 'continue': return 'continue';
			case 'return': {
				let v = null;
				if (ins[1]) { this.execList(ins[1], env, stack); v = stack.pop(); }
				return { return: v };
			}
			case 'discard': return { discard: true };
			default: throw new Error('GLSL runtime: bad IR op ' + op);
		}
	}
	execConstruct(ins, stack) {
		const [, type, argc] = ins;
		const args = [];
		for (let i = 0; i < argc; i++) args.unshift(stack.pop());
		stack.push(construct(type, args));
		return null;
	}
	callFn(name, args, env) {
		if (this.builtins[name]) return this.builtins[name](...args);
		const fn = this.program.functions.get(name);
		if (!fn) throw new Error('GLSL runtime: unknown function ' + name);
		const fenv = { vars: new Map(), parent: env, attribs: env.attribs, uniforms: env.uniforms,
			varyings: env.varyings, varyingNames: env.varyingNames, out: env.out, discard: false, fragCoord: env.fragCoord, loopDepth: 0 };
		fn.params.forEach((p, i) => fenv.vars.set(p.name, args[i] !== undefined ? args[i] : zeroOf(p.type)));
		const stack = [];
		const sig = this.execList(fn.body, fenv, stack);
		if (sig && sig.discard) return { __discarded: true };
		if (sig && 'return' in sig) return sig.return;
		return undefined;
	}
}

// ---- value operations ----
function arith(op, a, b) {
	[a, b] = promote(a, b);
	// matrix ops
	if (a.t === 'm' && b.t === 'm' && op === 'mul') return matMul(a, b);
	if (a.t === 'm' && b.t === 'v' && b.n === 4 && op === 'mul') return matVec(a, b);
	if (a.t === 'v' && a.n === 4 && b.t === 'm' && op === 'mul') return vecMat(a, b);
	if (a.t === 'm' && isScalar(b) && (op === 'mul' || op === 'div'))
		return M4(a.v.map(v => op === 'mul' ? v * toFloat(b) : v / toFloat(b)));
	const f = { add: (x, y) => x + y, sub: (x, y) => x - y, mul: (x, y) => x * y,
		div: (x, y) => x / y, mod: (x, y) => x - y * Math.floor(x / y) }[op];
	if (a.t === 'v' && b.t === 'v') {
		if (a.n !== b.n) throw new Error('GLSL runtime: vec size mismatch');
		return V(a.n, a.v.map((v, i) => f(v, b.v[i])));
	}
	if (a.t === 'v' && isScalar(b)) return V(a.n, a.v.map(v => f(v, toFloat(b))));
	if (isScalar(a) && b.t === 'v') return V(b.n, b.v.map(v => f(toFloat(a), v)));
	if (isScalar(a) && isScalar(b)) {
		if (a.t === 'i' && b.t === 'i' && op !== 'div') return I(f(a.v, b.v));
		return F(f(toFloat(a), toFloat(b)));
	}
	throw new Error('GLSL runtime: bad operands for ' + op);
}
function cmp(op, a, b) {
	[a, b] = promote(a, b);
	const f = { lt: (x, y) => x < y, gt: (x, y) => x > y, le: (x, y) => x <= y,
		ge: (x, y) => x >= y, eq: (x, y) => x === y, ne: (x, y) => x !== y }[op];
	if (a.t === 'v' && b.t === 'v' && a.n === b.n) return BV(a.n, a.v.map((v, i) => f(v, b.v[i])));
	if (isScalar(a) && isScalar(b)) return B(f(toFloat(a), toFloat(b)));
	throw new Error('GLSL runtime: bad operands for comparison');
}
function matMul(a, b) { // column-major
	const r = new Array(16).fill(0);
	for (let c = 0; c < 4; c++) for (let r_ = 0; r_ < 4; r_++) {
		let s = 0;
		for (let k = 0; k < 4; k++) s += a.v[k * 4 + r_] * b.v[c * 4 + k];
		r[c * 4 + r_] = s;
	}
	return M4(r);
}
function matVec(m, v) {
	const r = [];
	for (let row = 0; row < 4; row++) {
		let s = 0;
		for (let k = 0; k < 4; k++) s += m.v[k * 4 + row] * v.v[k];
		r.push(s);
	}
	return V(4, r);
}
function vecMat(v, m) {
	const r = [];
	for (let c = 0; c < 4; c++) {
		let s = 0;
		for (let k = 0; k < 4; k++) s += v.v[k] * m.v[c * 4 + k];
		r.push(s);
	}
	return V(4, r);
}
function makeVec(n, args) {
	// flatten: scalars fill, vecs spread
	const comps = [];
	for (const a of args) {
		if (a.t === 'v') comps.push(...a.v);
		else if (isScalar(a)) comps.push(toFloat(a));
		else throw new Error('GLSL runtime: bad vec constructor arg');
	}
	if (args.length === 1 && isScalar(args[0])) return V(n, new Array(n).fill(toFloat(args[0])));
	if (comps.length !== n) throw new Error('GLSL runtime: vec' + n + ' needs ' + n + ' components, got ' + comps.length);
	return V(n, comps);
}
function construct(type, args) {
	switch (type) {
		case 'float': return F(args.length ? toFloat(args[0]) : 0);
		case 'int': return I(args.length ? Math.trunc(toFloat(args[0])) : 0);
		case 'bool': return B(args.length ? truthy(args[0]) : false);
		case 'vec2': return makeVec(2, args);
		case 'vec3': return makeVec(3, args);
		case 'vec4': return makeVec(4, args);
		case 'ivec2': case 'ivec3': case 'ivec4': {
			const n = +type[4];
			const comps = [];
			for (const a of args) { if (a.t === 'v') comps.push(...a.v.map(Math.trunc)); else comps.push(Math.trunc(toFloat(a))); }
			if (args.length === 1 && isScalar(args[0])) return V(n, new Array(n).fill(Math.trunc(toFloat(args[0]))));
			return V(n, comps.slice(0, n));
		}
		case 'bvec2': case 'bvec3': case 'bvec4': {
			const n = +type[4];
			return BV(n, args.flatMap(a => a.t === 'bv' || a.t === 'v' ? a.v.map(Boolean) : [truthy(a)]).slice(0, n));
		}
		case 'mat4': {
			if (args.length === 0) return M4([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
			if (args.length === 1 && isScalar(args[0])) {
				const d = toFloat(args[0]);
				return M4([d,0,0,0, 0,d,0,0, 0,0,d,0, 0,0,0,d]);
			}
			if (args.length === 1 && args[0].t === 'm') return args[0];
			const comps = [];
			for (const a of args) { if (a.t === 'v') comps.push(...a.v); else comps.push(toFloat(a)); }
			if (comps.length !== 16) throw new Error('GLSL runtime: mat4 needs 16 components');
			return M4(comps);
		}
		default: throw new Error('GLSL runtime: bad constructor ' + type);
	}
}
function applySwizzle(val, mask) {
	if (val.t !== 'v') throw new Error('GLSL runtime: swizzle on non-vector');
	const idx = [...mask].map(ch => {
		if (!(ch in SWIZZLE_CHARS)) throw new Error('GLSL runtime: bad swizzle char ' + ch);
		const i = SWIZZLE_CHARS[ch];
		if (i >= val.n) throw new Error('GLSL runtime: swizzle out of range');
		return i;
	});
	if (idx.length === 1) return F(val.v[idx[0]]);
	return V(idx.length, idx.map(i => val.v[i]));
}
function applySwizzleStore(cur, mask, v) {
	if (cur.t !== 'v') throw new Error('GLSL runtime: swizzle store on non-vector');
	const idx = [...mask].map(ch => SWIZZLE_CHARS[ch]);
	const nv = cur.v.slice();
	const src = v.t === 'v' ? v.v : new Array(idx.length).fill(toFloat(v));
	idx.forEach((ci, k) => { nv[ci] = src[k]; });
	return V(cur.n, nv);
}
function indexValue(o, idx) {
	if (o.t === 'v') {
		if (idx < 0 || idx >= o.n) throw new Error('GLSL runtime: vec index OOB');
		return F(o.v[idx]);
	}
	if (o.t === 'm') return V(4, [o.v[idx * 4], o.v[idx * 4 + 1], o.v[idx * 4 + 2], o.v[idx * 4 + 3]]);
	if (o.t === 'arr') {
		if (idx < 0 || idx >= o.v.length) throw new Error('GLSL runtime: array index OOB');
		return o.v[idx];
	}
	throw new Error('GLSL runtime: index on non-indexable');
}
function applyIndexStore(cur, idx, v) {
	if (cur.t === 'v') {
		const nv = cur.v.slice(); nv[idx] = toFloat(v); return V(cur.n, nv);
	}
	if (cur.t === 'arr') {
		const nv = cur.v.slice(); nv[idx] = v; return ARR(cur.elem, nv);
	}
	throw new Error('GLSL runtime: index store on non-indexable');
}

// ---------------------------------------------------------------------------
// 7. Public API
// ---------------------------------------------------------------------------
function createShaderRunner(compiled) {
	const varyingNames = new Set((compiled.varyings || []).map(v => v.name));
	function execMain(entryInputs) {
		const runner = new Runner(compiled);
		const r = runner.run({ ...entryInputs, varyingNames });
		const mv = runner.callFn('main', [], r.env);
		return { env: r.env, mainValue: mv };
	}
	return {
		runVertex(attribs, uniforms) {
			const { env } = execMain({ attribs, uniforms, varyings: {}, globals: {} });
			const out = env.out;
			if (!out.gl_Position) throw new Error('GLSL runtime: vertex shader did not write gl_Position');
			const varyings = {};
			for (const v of compiled.varyings) varyings[v.name] = env.varyings[v.name] !== undefined
				? env.varyings[v.name] : zeroOf(v.type);
			return { position: out.gl_Position, varyings, pointSize: out.gl_PointSize };
		},
		runFragment(varyings, uniforms, fragCoord) {
			const { env, mainValue } = execMain({ attribs: {}, uniforms, varyings: { ...varyings }, fragCoord, globals: {} });
			if (mainValue && mainValue.__discarded) return { discarded: true };
			const out = env.out;
			const color = out.gl_FragColor || (out.gl_FragData && out.gl_FragData[0]);
			if (!color) throw new Error('GLSL runtime: fragment shader did not write gl_FragColor');
			return { discarded: false, color };
		}
	};
}

return { tokenize, parse, compileGLSL, createShaderRunner, BUILTINS, zeroOf, F, V };
});
