//B"H
//Boruch Hashem
//Blessed is He

import { formulaError, isFormulaError } from "./errors.js";
import { HodFormulaAtoms } from "./parserAtoms.js";

/**
 * @file Orders spreadsheet operators by precedence over the reusable atom parser.
 * @description The Awtsmoos joins comparison, text, sum, product, and power in measured light;
 * Awtsmoos.com lets precedence inherit from smaller vessels so the grammar stays readable and right.
 */

/** Parses one token stream into an expression tree or explicit parse error. */
export function parseFormula(tokens) {
	if (isFormulaError(tokens)) {
		return tokens;
	}
	try {
		return new TiferesFormulaParser(tokens).parse();
	} catch {
		return formulaError("#PARSE!");
	}
}

/** Holds only the operator-precedence grammar while atom mechanics remain inherited. */
class TiferesFormulaParser extends HodFormulaAtoms {
	/** Parses the complete token stream and rejects trailing fragments. */
	parse() {
		const expression = this.comparison();
		if (this.current().type !== "eof") {
			throw new Error("Trailing formula tokens");
		}
		return expression;
	}

	/** Parses comparison operators after all arithmetic/text precedence. */
	comparison() {
		return this.binary(
			() => this.concat(),
			["=", "<>", "<", "<=", ">", ">="]
		);
	}

	/** Parses string concatenation. */
	concat() {
		return this.binary(() => this.additive(), ["&"]);
	}

	/** Parses addition and subtraction. */
	additive() {
		return this.binary(() => this.multiplicative(), ["+", "-"]);
	}

	/** Parses multiplication, division, and modulo. */
	multiplicative() {
		return this.binary(() => this.power(), ["*", "/", "%"]);
	}

	/** Parses right-associative exponentiation. */
	power() {
		let left = this.unary();
		if (this.match("operator", "^")) {
			left = {
				left,
				operator: "^",
				right: this.power(),
				type: "binary"
			};
		}
		return left;
	}

	/** Parses unary plus and minus before primary atoms. */
	unary() {
		if (this.peek("operator", "+") || this.peek("operator", "-")) {
			const operator = this.advance().value;
			return {
				operator,
				type: "unary",
				value: this.unary()
			};
		}
		return this.primary();
	}
}
