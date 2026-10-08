//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Parser for the Awtsmoos Design OS constraint language.
 * @description Parses design intent expressed as mathematical constraints into an AST.
 * The Design OS replaces CSS with provable constraints: instead of writing styles that
 * might conflict, designers declare what must be true, and the solver finds values.
 *
 * Syntax:
 *   // comments
 *   title.fontSize = 4 * body.fontSize        // arithmetic over paths
 *   contrast(title.fg, title.bg) >= 7.0        // function call in comparison
 *   layout.width in [375, 1920]               // range membership
 *   hebrew.direction = rtl                    // keyword value
 *   title.color = #2b2118                      // hex color literal
 *   body.fontSize = 16px                       // dimension literal
 *   english.position = below(hebrew)           // function as value
 *
 * Grammar:
 *   program     := statement*
 *   statement   := constraint ';'? | comment
 *   constraint  := path op value
 *   op          := '=' | '>=' | '<=' | '>' | '<' | 'in'
 *   value       := expr | range
 *   range       := '[' expr ',' expr ']'
 *   expr        := term (('+' | '-') term)*
 *   term        := factor (('*' | '/') factor)*
 *   factor      := number | dimension | color | string | path | call | '(' expr ')'
 *   call        := ident '(' args? ')'
 *   path        := ident ('.' ident)*
 */

/** Token types. */
const TT = {
	IDENT: "ident",
	NUMBER: "number",
	DIMENSION: "dimension",
	COLOR: "color",
	STRING: "string",
	OP: "op",
	LPAREN: "lparen",
	RPAREN: "rparen",
	LBRACKET: "lbracket",
	RBRACKET: "rbracket",
	COMMA: "comma",
	DOT: "dot",
	SEMICOLON: "semicolon",
	EOF: "eof",
};

/**
 * Tokenizes constraint source text.
 * @param {string} src Source text.
 * @returns {Array<{type:string,value:any,line:number,col:number}>} Token list.
 */
export function tokenize(src) {
	const tokens = [];
	let i = 0;
	let line = 1;
	let col = 1;
	const text = String(src);

	function push(type, value) {
		tokens.push({ type, value, line, col });
	}

	while (i < text.length) {
		const ch = text[i];

		// Whitespace
		if (ch === " " || ch === "\t" || ch === "\r") {
			i++; col++;
			continue;
		}
		if (ch === "\n") {
			i++; line++; col = 1;
			continue;
		}

		// Comments
		if (ch === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") { i++; }
			continue;
		}

		// Multi-char operators
		if (ch === ">" && text[i + 1] === "=") { push(TT.OP, ">="); i += 2; col += 2; continue; }
		if (ch === "<" && text[i + 1] === "=") { push(TT.OP, "<="); i += 2; col += 2; continue; }
		if (ch === "=" && text[i + 1] === "=") { push(TT.OP, "=="); i += 2; col += 2; continue; }
		if (ch === "!" && text[i + 1] === "=") { push(TT.OP, "!="); i += 2; col += 2; continue; }

		// Single-char operators
		if (ch === "=" || ch === ">" || ch === "<" || ch === "+" || ch === "-" || ch === "*" || ch === "/") {
			push(TT.OP, ch); i++; col++;
			continue;
		}

		// Punctuation
		if (ch === "(") { push(TT.LPAREN, ch); i++; col++; continue; }
		if (ch === ")") { push(TT.RPAREN, ch); i++; col++; continue; }
		if (ch === "[") { push(TT.LBRACKET, ch); i++; col++; continue; }
		if (ch === "]") { push(TT.RBRACKET, ch); i++; col++; continue; }
		if (ch === ",") { push(TT.COMMA, ch); i++; col++; continue; }
		if (ch === ".") { push(TT.DOT, ch); i++; col++; continue; }
		if (ch === ";") { push(TT.SEMICOLON, ch); i++; col++; continue; }

		// Hex color: #rgb, #rrggbb
		if (ch === "#") {
			let j = i + 1;
			while (j < text.length && /[0-9a-fA-F]/.test(text[j])) j++;
			const hex = text.slice(i, j);
			if (hex.length === 4 || hex.length === 7) {
				push(TT.COLOR, hex.toLowerCase());
				col += hex.length; i = j;
				continue;
			}
			throw parseError(`Invalid hex color at`, line, col);
		}

		// String literal
		if (ch === '"' || ch === "'") {
			const quote = ch;
			let j = i + 1;
			let val = "";
			while (j < text.length && text[j] !== quote) {
				if (text[j] === "\\" && j + 1 < text.length) {
					val += text[j + 1];
					j += 2;
				} else {
					val += text[j];
					j++;
				}
			}
			if (j >= text.length) throw parseError("Unterminated string at", line, col);
			push(TT.STRING, val);
			col += (j - i + 1); i = j + 1;
			continue;
		}

		// Number (with optional dimension unit)
		if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(text[i + 1] || ""))) {
			let j = i;
			while (j < text.length && /[0-9.]/.test(text[j])) j++;
			const numStr = text.slice(i, j);
			// Check for unit
			let k = j;
			while (k < text.length && /[a-zA-Z%]/.test(text[k])) k++;
			const unit = text.slice(j, k);
			const num = parseFloat(numStr);
			if (Number.isNaN(num)) throw parseError(`Invalid number at`, line, col);
			if (unit) {
				push(TT.DIMENSION, { value: num, unit });
			} else {
				push(TT.NUMBER, num);
			}
			col += (k - i); i = k;
			continue;
		}

		// Identifier or keyword ('in')
		if (/[a-zA-Z_]/.test(ch)) {
			let j = i;
			while (j < text.length && /[a-zA-Z0-9_]/.test(text[j])) j++;
			const word = text.slice(i, j);
			if (word === "in") {
				push(TT.OP, "in");
			} else {
				push(TT.IDENT, word);
			}
			col += (j - i); i = j;
			continue;
		}

		throw parseError(`Unexpected character '${ch}' at`, line, col);
	}

	push(TT.EOF, null);
	return tokens;
}

/** Creates a parse error with location. */
function parseError(msg, line, col) {
	const err = new Error(`${msg} line ${line}, col ${col}`);
	err.line = line;
	err.col = col;
	return err;
}

/**
 * Recursive-descent parser producing an AST.
 */
class Parser {
	constructor(tokens) {
		this.tokens = tokens;
		this.pos = 0;
	}

	peek() { return this.tokens[this.pos]; }
	next() { return this.tokens[this.pos++]; }

	expect(type, value) {
		const t = this.next();
		if (t.type !== type || (value !== undefined && t.value !== value)) {
			throw parseError(
				`Expected ${value !== undefined ? `'${value}'` : type}, got '${t.value}' at`,
				t.line, t.col
			);
		}
		return t;
	}

	at(type, value) {
		const t = this.peek();
		return t.type === type && (value === undefined || t.value === value);
	}

	parseProgram() {
		const statements = [];
		while (!this.at(TT.EOF)) {
			if (this.at(TT.SEMICOLON)) { this.next(); continue; }
			statements.push(this.parseConstraint());
			if (this.at(TT.SEMICOLON)) this.next();
		}
		return { type: "program", statements };
	}

	parseConstraint() {
		const subject = this.parseSubject();
		const opTok = this.next();
		if (opTok.type !== TT.OP || !["=", ">=", "<=", ">", "<", "in", "==", "!="].includes(opTok.value)) {
			throw parseError(`Expected constraint operator, got '${opTok.value}' at`, opTok.line, opTok.col);
		}
		let value;
		if (opTok.value === "in") {
			value = this.parseRange();
		} else {
			value = this.parseExpr();
		}
		return {
			type: "constraint",
			target: subject.type === "path" ? subject : null,
			subject,
			op: opTok.value,
			value,
			line: opTok.line,
		};
	}

	/**
	 * Parses a constraint subject: either a dotted path (assignable target)
	 * or a function call (e.g. contrast(a, b) >= 7.0 — constrains the result).
	 */
	parseSubject() {
		// Lookahead: ident followed by '(' → call subject
		const t = this.peek();
		const nextTok = this.tokens[this.pos + 1];
		if (t.type === TT.IDENT && nextTok && nextTok.type === TT.LPAREN) {
			return this.parseCall();
		}
		return this.parsePath();
	}

	parsePath() {
		const parts = [];
		const first = this.expect(TT.IDENT);
		parts.push(first.value);
		while (this.at(TT.DOT)) {
			this.next();
			const part = this.expect(TT.IDENT);
			parts.push(part.value);
		}
		return { type: "path", parts };
	}

	parseRange() {
		this.expect(TT.LBRACKET);
		const min = this.parseExpr();
		this.expect(TT.COMMA);
		const max = this.parseExpr();
		this.expect(TT.RBRACKET);
		return { type: "range", min, max };
	}

	parseExpr() {
		let left = this.parseTerm();
		while (this.at(TT.OP, "+") || this.at(TT.OP, "-")) {
			const op = this.next().value;
			const right = this.parseTerm();
			left = { type: "binary", op, left, right };
		}
		return left;
	}

	parseTerm() {
		let left = this.parseFactor();
		while (this.at(TT.OP, "*") || this.at(TT.OP, "/")) {
			const op = this.next().value;
			const right = this.parseFactor();
			left = { type: "binary", op, left, right };
		}
		return left;
	}

	parseFactor() {
		const t = this.peek();

		// Unary minus
		if (t.type === TT.OP && t.value === "-") {
			this.next();
			const operand = this.parseFactor();
			return { type: "unary", op: "-", operand };
		}

		// Parenthesized
		if (t.type === TT.LPAREN) {
			this.next();
			const expr = this.parseExpr();
			this.expect(TT.RPAREN);
			return expr;
		}

		// Number
		if (t.type === TT.NUMBER) {
			this.next();
			return { type: "number", value: t.value };
		}

		// Dimension
		if (t.type === TT.DIMENSION) {
			this.next();
			return { type: "dimension", value: t.value.value, unit: t.value.unit };
		}

		// Color
		if (t.type === TT.COLOR) {
			this.next();
			return { type: "color", hex: t.value };
		}

		// String
		if (t.type === TT.STRING) {
			this.next();
			return { type: "string", value: t.value };
		}

		// Identifier: path, keyword, or function call
		if (t.type === TT.IDENT) {
			// Lookahead: is it a call? ident followed by '('
			const nextTok = this.tokens[this.pos + 1];
			if (nextTok && nextTok.type === TT.LPAREN) {
				return this.parseCall();
			}
			// Otherwise parse as path; a single-part path that isn't a known
			// value position may be a keyword (rtl, below target handled by call)
			const path = this.parsePath();
			if (path.parts.length === 1 && isKeyword(path.parts[0])) {
				return { type: "keyword", value: path.parts[0] };
			}
			return path;
		}

		throw parseError(`Unexpected token '${t.value}' in expression at`, t.line, t.col);
	}

	parseCall() {
		const nameTok = this.expect(TT.IDENT);
		this.expect(TT.LPAREN);
		const args = [];
		if (!this.at(TT.RPAREN)) {
			args.push(this.parseExpr());
			while (this.at(TT.COMMA)) {
				this.next();
				args.push(this.parseExpr());
			}
		}
		this.expect(TT.RPAREN);
		return { type: "call", name: nameTok.value, args };
	}
}

/** Keywords that stand alone as values (not paths). */
const KEYWORDS = new Set([
	"rtl", "ltr", "auto",
	"bold", "normal", "italic",
	"center", "left", "right", "justify",
	"serif", "sans", "mono",
	"block", "inline", "flex", "grid", "none",
	"true", "false",
]);

function isKeyword(word) {
	return KEYWORDS.has(word);
}

/**
 * Parses constraint source text into an AST.
 * @param {string} src Source text in the constraint DSL.
 * @returns {{type:"program",statements:Array}} AST root.
 * @throws {Error} On syntax errors, with line/col.
 */
export function parse(src) {
	const tokens = tokenize(src);
	const parser = new Parser(tokens);
	return parser.parseProgram();
}

/**
 * Returns a canonical string form of an AST node (for debugging/tests).
 * @param {object} node AST node.
 * @returns {string} Canonical form.
 */
export function astToString(node) {
	switch (node.type) {
		case "program":
			return node.statements.map(astToString).join("\n");
		case "constraint": {
			const subj = node.subject ? astToString(node.subject)
				: (node.target ? pathToString(node.target) : "?");
			return `${subj} ${node.op} ${astToString(node.value)}`;
		}
		case "path":
			return pathToString(node);
		case "number":
			return String(node.value);
		case "dimension":
			return `${node.value}${node.unit}`;
		case "color":
			return node.hex;
		case "string":
			return JSON.stringify(node.value);
		case "keyword":
			return node.value;
		case "binary":
			return `(${astToString(node.left)} ${node.op} ${astToString(node.right)})`;
		case "unary":
			return `(${node.op}${astToString(node.operand)})`;
		case "call":
			return `${node.name}(${node.args.map(astToString).join(", ")})`;
		case "range":
			return `[${astToString(node.min)}, ${astToString(node.max)}]`;
		default:
			return `<?>`;
	}
}

function pathToString(path) {
	return path.parts.join(".");
}
