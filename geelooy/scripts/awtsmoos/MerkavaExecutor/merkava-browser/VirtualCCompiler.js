// B"H
// VirtualCCompiler.js — minimal C compiler in pure JS, from absolute scratch.
//
// Design: a C-subset compiler whose backend emits WebAssembly BINARY directly
// (hand-assembled bytes: magic, sections, LEB128, opcodes). No LLVM, no
// external tools, no native addons. Node instantiates the bytes with the
// built-in WebAssembly API, so compiled rasterizer inner loops run at
// near-native speed — the honest "from nothing" native path. (Raw x86-64
// emission is also just bytes, but invoking it requires executable memory,
// which needs native bindings — impossible from pure JS. Wasm is the pure-JS
// route to native speed.)
//
// Supported C subset:
//   types: int, float
//   functions: int/float params, int/float return
//   statements: local decls (with optional init), assignment, if/else,
//               while, for, return, expression statements
//   expressions: + - * / % < <= > >= == != && || ! unary minus, parens,
//                function calls (to other compiled functions)
//   NOT supported (honest): pointers, arrays, structs, strings, preprocessor,
//   switch, do-while, goto, global variables, implicit conversions (int/float
//   are distinct; no promotion — say what you mean).
(function(root, factory) {
	if (typeof module === 'object' && module.exports) module.exports = factory();
	else { root.Merkava = root.Merkava || {}; Object.assign(root.Merkava, factory()); }
})(typeof self !== 'undefined' ? self : this, function() {
'use strict';

// ---------- LEB128 ----------
function uleb(n, out) {
	n >>>= 0;
	do { let b = n & 0x7F; n >>>= 7; out.push(n ? b | 0x80 : b); } while (n);
}
function sleb(n, out) {
	let more = true;
	while (more) {
		let b = n & 0x7F; n >>= 7;
		const sign = b & 0x40;
		more = !((n === 0 && !sign) || (n === -1 && sign));
		out.push(more ? b | 0x80 : b);
	}
}

// ---------- tokenizer ----------
const KEYWORDS = new Set(['int', 'float', 'if', 'else', 'while', 'for', 'return']);
function tokenize(src) {
	const toks = [];
	let i = 0;
	const isId = c => /[A-Za-z_]/.test(c), isDig = c => /[0-9]/.test(c);
	while (i < src.length) {
		const c = src[i];
		if (/\s/.test(c)) { i++; continue; }
		if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
		if (c === '/' && src[i + 1] === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
		if (isId(c)) {
			let j = i; while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
			const w = src.slice(i, j); i = j;
			toks.push({ t: KEYWORDS.has(w) ? 'kw' : 'id', v: w });
			continue;
		}
		if (isDig(c) || (c === '.' && isDig(src[i + 1]))) {
			let j = i, isF = false;
			while (j < src.length && /[0-9.]/.test(src[j])) { if (src[j] === '.') isF = true; j++; }
			toks.push({ t: 'num', v: src.slice(i, j), isF }); i = j; continue;
		}
		const two = src.substr(i, 2);
		if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) { toks.push({ t: 'op', v: two }); i += 2; continue; }
		if ('+-*/%<>=!;,.(){}'.includes(c)) { toks.push({ t: c === '(' || c === ')' || c === '{' || c === '}' || c === ';' || c === ',' ? 'p' : 'op', v: c }); i++; continue; }
		throw new Error('C lexer: bad char ' + JSON.stringify(c));
	}
	toks.push({ t: 'eof', v: '' });
	return toks;
}

// ---------- parser ----------
function parse(src) {
	const toks = tokenize(src);
	let pos = 0;
	const peek = () => toks[pos], next = () => toks[pos++];
	function expect(t, v) {
		const k = next();
		if (k.t !== t || (v !== undefined && k.v !== v)) throw new Error('C parse: expected ' + (v || t) + ' got ' + k.v);
		return k;
	}
	function parseType() {
		const k = next();
		if (k.t === 'kw' && (k.v === 'int' || k.v === 'float')) return k.v;
		throw new Error('C parse: expected type, got ' + k.v);
	}
	// expressions (precedence climbing)
	function parseExpr() { return parseAssign(); }
	function parseAssign() {
		if (peek().t === 'id' && toks[pos + 1] && toks[pos + 1].v === '=') {
			const name = next().v; next();
			return { k: 'assignE', name, e: parseAssign() };
		}
		return parseOr();
	}
	function parseOr() { let e = parseAnd(); while (peek().v === '||') { next(); e = { k: 'bin', op: '||', l: e, r: parseAnd() }; } return e; }
	function parseAnd() { let e = parseEq(); while (peek().v === '&&') { next(); e = { k: 'bin', op: '&&', l: e, r: parseEq() }; } return e; }
	function parseEq() { let e = parseCmp(); while (peek().v === '==' || peek().v === '!=') { const op = next().v; e = { k: 'bin', op, l: e, r: parseCmp() }; } return e; }
	function parseCmp() { let e = parseAdd(); while (['<', '<=', '>', '>='].includes(peek().v)) { const op = next().v; e = { k: 'bin', op, l: e, r: parseAdd() }; } return e; }
	function parseAdd() { let e = parseMul(); while (peek().v === '+' || peek().v === '-') { const op = next().v; e = { k: 'bin', op, l: e, r: parseMul() }; } return e; }
	function parseMul() { let e = parseUnary(); while (peek().v === '*' || peek().v === '/' || peek().v === '%') { const op = next().v; e = { k: 'bin', op, l: e, r: parseUnary() }; } return e; }
	function parseUnary() {
		if (peek().v === '-') { next(); return { k: 'un', op: '-', e: parseUnary() }; }
		if (peek().v === '!') { next(); return { k: 'un', op: '!', e: parseUnary() }; }
		return parsePostfix();
	}
	function parsePostfix() {
		let e = parsePrimary();
		while (peek().v === '(' && e.k === 'id') {
			next(); const args = [];
			if (peek().v !== ')') { args.push(parseExpr()); while (peek().v === ',') { next(); args.push(parseExpr()); } }
			expect('p', ')');
			e = { k: 'call', name: e.name, args };
		}
		return e;
	}
	function parsePrimary() {
		const k = next();
		if (k.t === 'num') return { k: 'num', v: parseFloat(k.v), isF: k.isF || k.v.includes('.') };
		if (k.t === 'id') return { k: 'id', name: k.v };
		if (k.v === '(') { const e = parseExpr(); expect('p', ')'); return e; }
		throw new Error('C parse: unexpected ' + k.v);
	}
	function parseStmt() {
		const k = peek();
		if (k.t === 'kw' && (k.v === 'int' || k.v === 'float')) {
			const type = next().v, name = expect('id').v;
			let init = null;
			if (peek().v === '=') { next(); init = parseExpr(); }
			expect('p', ';');
			return { k: 'decl', type, name, init };
		}
		if (k.v === 'if') {
			next(); expect('p', '('); const cond = parseExpr(); expect('p', ')');
			const thenB = parseBlockOrStmt(); let elseB = null;
			if (peek().v === 'else') { next(); elseB = parseBlockOrStmt(); }
			return { k: 'if', cond, thenB, elseB };
		}
		if (k.v === 'while') {
			next(); expect('p', '('); const cond = parseExpr(); expect('p', ')');
			return { k: 'while', cond, body: parseBlockOrStmt() };
		}
		if (k.v === 'for') {
			next(); expect('p', '(');
			const init = parseForInit(); const cond = parseExpr(); expect('p', ';');
			const step = parseExpr(); expect('p', ')');
			return { k: 'for', init, cond, step, body: parseBlockOrStmt() };
		}
		if (k.v === 'return') { next(); const e = parseExpr(); expect('p', ';'); return { k: 'return', e }; }
		if (k.v === '{') return parseBlock();
		// assignment or expression statement
		if (k.t === 'id' && toks[pos + 1] && toks[pos + 1].v === '=') {
			const name = next().v; next(); const e = parseExpr(); expect('p', ';');
			return { k: 'assign', name, e };
		}
		const e = parseExpr(); expect('p', ';');
		return { k: 'expr', e };
	}
	function parseForInit() {
		if (peek().v === ';') { next(); return null; }
		const k = peek();
		if (k.t === 'kw' && (k.v === 'int' || k.v === 'float')) {
			const type = next().v, name = expect('id').v;
			let init = null;
			if (peek().v === '=') { next(); init = parseExpr(); }
			expect('p', ';');
			return { k: 'decl', type, name, init };
		}
		const e = parseExpr(); expect('p', ';'); return { k: 'expr', e };
	}
	function parseBlockOrStmt() { return peek().v === '{' ? parseBlock() : { k: 'block', stmts: [parseStmt()] }; }
	function parseBlock() {
		expect('p', '{'); const stmts = [];
		while (peek().v !== '}') stmts.push(parseStmt());
		expect('p', '}');
		return { k: 'block', stmts };
	}
	const funcs = [];
	while (peek().t !== 'eof') {
		const type = parseType(), name = expect('id').v;
		expect('p', '('); const params = [];
		if (peek().v !== ')') {
			params.push({ type: parseType(), name: expect('id').v });
			while (peek().v === ',') { next(); params.push({ type: parseType(), name: expect('id').v }); }
		}
		expect('p', ')');
		funcs.push({ k: 'func', type, name, params, body: parseBlock() });
	}
	return funcs;
}

// ---------- Wasm emitter ----------
const I32 = 0x7F, F32 = 0x7D;
const WT = { int: I32, float: F32 };

function compileC(src) {
	const funcs = parse(src);
	const typeMap = new Map(); // signature key -> type index
	const types = []; // {params:[], result}
	const funcTypes = [];
	for (const f of funcs) {
		const key = f.params.map(p => p.type).join(',') + '->' + f.type;
		if (!typeMap.has(key)) {
			typeMap.set(key, types.length);
			types.push({ params: f.params.map(p => WT[p.type]), result: f.type === 'void' ? [] : [WT[f.type]] });
		}
		funcTypes.push(typeMap.get(key));
	}
	const funcIndex = new Map(funcs.map((f, i) => [f.name, i]));

	const codeBodies = [];
	for (const f of funcs) {
		const body = [];
		// locals: params first, then declared locals
		const localTypes = f.params.map(p => p.type);
		const varIndex = new Map();
		f.params.forEach((p, i) => varIndex.set(p.name, i));
		const localDecls = []; // {type, name}
		function declareVar(type, name) {
			if (varIndex.has(name)) throw new Error('C: redeclaration of ' + name);
			varIndex.set(name, localTypes.length);
			localTypes.push(type);
			localDecls.push(type);
		}
		const OP = {
			'local.get': 0x20, 'local.set': 0x21, 'i32.const': 0x41, 'f32.const': 0x43,
			'i32.add': 0x6A, 'i32.sub': 0x6B, 'i32.mul': 0x6C, 'i32.div_s': 0x6D, 'i32.rem_s': 0x6F,
			'i32.and': 0x71, 'i32.or': 0x72, 'i32.eq': 0x46, 'i32.ne': 0x47,
			'i32.lt_s': 0x48, 'i32.le_s': 0x4C, 'i32.gt_s': 0x4A, 'i32.ge_s': 0x4E,
			'f32.add': 0x92, 'f32.sub': 0x93, 'f32.mul': 0x94, 'f32.div': 0x95,
			'f32.eq': 0x5B, 'f32.ne': 0x5C, 'f32.lt': 0x5D, 'f32.le': 0x61, 'f32.gt': 0x5E, 'f32.ge': 0x60,
			'f32.neg': 0x8C, 'i32.eqz': 0x45,
			'block': 0x02, 'loop': 0x03, 'if': 0x04, 'else': 0x05, 'end': 0x0B,
			'br': 0x0C, 'br_if': 0x0D, 'return': 0x0F, 'drop': 0x1A,
		};
		const isF = t => t === 'float';
		function emitExpr(e, want) {
			// want: 'int' | 'float' — the type this expression must produce
			if (e.k === 'num') {
				if (want === 'float') { body.push(OP['f32.const']); const b = Buffer.alloc(4); b.writeFloatLE(e.v, 0); for (const x of b) body.push(x); }
				else { body.push(OP['i32.const']); sleb(Math.trunc(e.v), body); }
				return;
			}
			if (e.k === 'id') {
				if (!varIndex.has(e.name)) throw new Error('C: unknown variable ' + e.name);
				body.push(OP['local.get']); uleb(varIndex.get(e.name), body);
				return;
			}
			if (e.k === 'un') {
				emitExpr(e.e, want);
				if (e.op === '-') {
					if (want === 'float') body.push(OP['f32.neg']);
					else { body.push(OP['i32.const']); sleb(-1, body); body.push(OP['i32.mul']); }
				}
				if (e.op === '!') body.push(OP['i32.eqz']);
				return;
			}
			if (e.k === 'call') {
				const fi = funcIndex.get(e.name);
				if (fi === undefined) throw new Error('C: unknown function ' + e.name);
				const callee = funcs[fi];
				e.args.forEach((a, i) => emitExpr(a, callee.params[i].type));
				body.push(0x10); uleb(fi, body); // call
				return;
			}
			if (e.k === 'assignE') {
				if (!varIndex.has(e.name)) throw new Error('C: unknown variable ' + e.name);
				const t = localTypes[varIndex.get(e.name)];
				emitExpr(e.e, t);
				body.push(0x22); uleb(varIndex.get(e.name), body); // local.tee: store, keep value
				return;
			}
			if (e.k === 'bin') {
				const cmp = ['<', '<=', '>', '>=', '==', '!='].includes(e.op);
				const logic = e.op === '&&' || e.op === '||';
				const et = (cmp || logic) ? 'int' : want;
				if (logic) {
					// a && b -> if-like via i32.and on normalized conditions
					emitExpr(e.l, 'int'); emitBoolNorm();
					emitExpr(e.r, 'int'); emitBoolNorm();
					body.push(e.op === '&&' ? OP['i32.and'] : OP['i32.or']);
					return;
				}
				emitExpr(e.l, et); emitExpr(e.r, et);
				const f = et === 'float';
				const m = {
					'+': f ? 'f32.add' : 'i32.add', '-': f ? 'f32.sub' : 'i32.sub',
					'*': f ? 'f32.mul' : 'i32.mul', '/': f ? 'f32.div' : 'i32.div_s',
					'%': 'i32.rem_s',
					'<': f ? 'f32.lt' : 'i32.lt_s', '<=': f ? 'f32.le' : 'i32.le_s',
					'>': f ? 'f32.gt' : 'i32.gt_s', '>=': f ? 'f32.ge' : 'i32.ge_s',
					'==': f ? 'f32.eq' : 'i32.eq', '!=': f ? 'f32.ne' : 'i32.ne',
				}[e.op];
				if (!m) throw new Error('C: bad operator ' + e.op);
				body.push(OP[m]);
				return;
			}
			throw new Error('C: bad expr ' + e.k);
		}
		function emitBoolNorm() {
			// normalize top-of-stack i32 to 0/1 (i32.ne 0)
			body.push(OP['i32.const']); sleb(0, body); body.push(OP['i32.ne']);
		}
		function emitStmt(s) {
			switch (s.k) {
				case 'decl': {
					declareVar(s.type, s.name);
					if (s.init) { emitExpr(s.init, s.type); body.push(OP['local.set']); uleb(varIndex.get(s.name), body); }
					return;
				}
				case 'assign': {
					if (!varIndex.has(s.name)) throw new Error('C: unknown variable ' + s.name);
					const t = localTypes[varIndex.get(s.name)];
					emitExpr(s.e, t); body.push(OP['local.set']); uleb(varIndex.get(s.name), body);
					return;
				}
				case 'expr': emitExpr(s.e, 'int'); body.push(OP['drop']); return;
				case 'return': emitExpr(s.e, f.type); body.push(OP['return']); return;
				case 'block': for (const x of s.stmts) emitStmt(x); return;
				case 'if': {
					emitExpr(s.cond, 'int'); emitBoolNorm();
					body.push(OP['if'], 0x40); // void
					emitStmt(s.thenB);
					if (s.elseB) { body.push(OP['else']); emitStmt(s.elseB); }
					body.push(OP['end']);
					return;
				}
				case 'while': {
					body.push(OP['block'], 0x40, OP['loop'], 0x40);
					emitExpr(s.cond, 'int'); emitBoolNorm();
					body.push(OP['i32.eqz'], OP['br_if']); uleb(1, body);
					emitStmt(s.body);
					body.push(OP['br']); uleb(0, body);
					body.push(OP['end'], OP['end']);
					return;
				}
				case 'for': {
					if (s.init) emitStmt(s.init);
					body.push(OP['block'], 0x40, OP['loop'], 0x40);
					emitExpr(s.cond, 'int'); emitBoolNorm();
					body.push(OP['i32.eqz'], OP['br_if']); uleb(1, body);
					emitStmt(s.body);
					emitExpr(s.step, 'int'); body.push(OP['drop']);
					body.push(OP['br']); uleb(0, body);
					body.push(OP['end'], OP['end']);
					return;
				}
			}
			throw new Error('C: bad stmt ' + s.k);
		}
		emitStmt(f.body);
		body.push(OP['end']);
		// locals section: group consecutive same-type locals
		const groups = [];
		for (const t of localDecls) {
			const w = WT[t];
			const g = groups[groups.length - 1];
			if (g && g[1] === w) g[0]++;
			else groups.push([1, w]);
		}
		const code = [];
		uleb(groups.length, code);
		for (const [n, w] of groups) { uleb(n, code); code.push(w); }
		for (const b of body) code.push(b & 0xFF);
		codeBodies.push(code);
	}

	// assemble module
	const mod = [0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00];
	function section(id, payload) { mod.push(id); uleb(payload.length, mod); for (const b of payload) mod.push(b); }
	// type section
	{
		const p = []; uleb(types.length, p);
		for (const t of types) {
			p.push(0x60); uleb(t.params.length, p); for (const x of t.params) p.push(x);
			uleb(t.result.length, p); for (const x of t.result) p.push(x);
		}
		section(1, p);
	}
	// function section
	{ const p = []; uleb(funcTypes.length, p); for (const t of funcTypes) uleb(t, p); section(3, p); }
	// export section (export every function by name)
	{
		const p = []; uleb(funcs.length, p);
		for (let i = 0; i < funcs.length; i++) {
			const name = Buffer.from(funcs[i].name, 'utf8');
			uleb(name.length, p); for (const b of name) p.push(b);
			p.push(0x00); uleb(i, p);
		}
		section(7, p);
	}
	// code section
	{ const p = []; uleb(codeBodies.length, p); for (const c of codeBodies) { uleb(c.length, p); for (const b of c) p.push(b); } section(10, p); }
	return { bytes: Uint8Array.from(mod), functions: funcs.map(f => f.name) };
}

async function instantiateC(src) {
	const { bytes, functions } = compileC(src);
	const mod = await WebAssembly.compile(bytes);
	const inst = await WebAssembly.instantiate(mod, {});
	return { exports: inst.exports, functions };
}

return { tokenize, parse, compileC, instantiateC };
});
