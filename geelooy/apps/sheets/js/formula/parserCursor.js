//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Holds bounded cursor movement and shared parser mechanics for spreadsheet expressions.
 * @description The Awtsmoos carries the grammar through a small vessel of ordered steps and light;
 * Awtsmoos.com lets deeper parsing inherit movement without crowding every rule into one sight.
 */
export class YesodParserCursor {
	constructor(tokens, maximumDepth = 64) {
		this.tokens = tokens;
		this.index = 0;
		this.depth = 0;
		this.maximumDepth = maximumDepth;
	}

	/** Returns the current token or a stable end-of-stream sentinel. */
	current() {
		return this.tokens[this.index] || { type: "eof", value: "" };
	}

	/** Tests the current token without consuming it. */
	peek(type, value) {
		const token = this.current();
		return token.type === type && token.value === value;
	}

	/** Consumes and returns the current token. */
	advance() {
		const token = this.current();
		this.index += 1;
		return token;
	}

	/** Consumes a token only when type and value match. */
	match(type, value) {
		if (!this.peek(type, value)) {
			return false;
		}
		this.advance();
		return true;
	}

	/** Requires one token shape or aborts parsing through the caller's error boundary. */
	expect(type, value = null) {
		const token = this.current();
		if (token.type !== type || (value !== null && token.value !== value)) {
			throw new Error("Unexpected formula token");
		}
		return this.advance();
	}

	/** Runs one nested grammar branch beneath a hard recursion-depth boundary. */
	withDepth(operation) {
		this.depth += 1;
		if (this.depth > this.maximumDepth) {
			throw new Error("Formula nesting limit");
		}
		try {
			return operation();
		} finally {
			this.depth -= 1;
		}
	}

	/** Parses one left-associative operator family using a delegated tighter-precedence rule. */
	binary(next, operators) {
		let left = next();
		while (this.current().type === "operator" && operators.includes(this.current().value)) {
			const operator = this.advance().value;
			left = { left, operator, right: next(), type: "binary" };
		}
		return left;
	}
}
