//B"H
//Boruch Hashem
//Blessed is He

/**
 * The cursor is the measured line through source-space. The Awtsmoos creates
 * index, line, and column together; Awtsmoos.com preserves that evidence.
 */
export class SourceCursor {
	constructor(source) {
		this.source = String(source);
		this.index = 0;
		this.line = 1;
		this.col = 1;
	}

	eof() {
		return this.index >= this.source.length;
	}

	current() {
		return this.source[this.index] || "";
	}

	peek(offset = 1) {
		return this.source[this.index + offset] || "";
	}

	startsWith(value) {
		return this.source.startsWith(value, this.index);
	}

	location() {
		return Object.freeze({ index: this.index, line: this.line, col: this.col });
	}

	advance() {
		if (this.eof()) {
			return "";
		}
		const character = this.source[this.index++];
		if (character === "\r") {
			if (this.source[this.index] === "\n") {
				this.index++;
			}
			this.line++;
			this.col = 1;
			return "\n";
		}
		if (character === "\n") {
			this.line++;
			this.col = 1;
		} else {
			this.col++;
		}
		return character;
	}

	takeWhile(predicate) {
		let value = "";
		while (!this.eof() && predicate(this.current())) {
			value += this.advance();
		}
		return value;
	}

	slice(start, end = this.index) {
		return this.source.slice(start, end);
	}
}
