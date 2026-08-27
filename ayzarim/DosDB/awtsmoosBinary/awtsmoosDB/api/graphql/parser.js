// B"H

/**
 * @file api/graphql/parser.js
 * @chapter The Selection Tree
 * @description Parses a practical GraphQL subset into table operations.
 */

class Parser {
  constructor(tokens) { this.t = tokens; this.i = 0; }
  peek() { return this.t[this.i]; }
  next() { return this.t[this.i++]; }
  eat(v) { const x = this.peek(); if (x && (x.value === v || x.type === v)) return this.next(); return null; }
  need(v) { const x = this.eat(v); if (!x) throw new Error(`B"H: GraphQL expected ${v}`); return x; }
  name() { return this.need('name').value; }

  parse() {
    const op = this.peek() && this.peek().value === 'mutation' ? this.next().value : 'query';
    this.need('{');
    const fields = [];
    while (!this.eat('}')) fields.push(this.field(op));
    return { op, fields };
  }

  field(op) {
    const name = this.name();
    const args = this.args();
    const select = this.selection();
    return { op, name, args, select };
  }

  args() {
    const out = {};
    if (!this.eat('(')) return out;
    while (!this.eat(')')) {
      const key = this.name();
      this.need(':');
      out[key] = this.value();
      this.eat(',');
    }
    return out;
  }

  selection() {
    const fields = [];
    if (!this.eat('{')) return fields;
    while (!this.eat('}')) fields.push(this.name());
    return fields;
  }

  value() {
    const x = this.next();
    if (!x) throw new Error('B"H: GraphQL expected value');
    if (x.value === '[') {
      const list = [];
      while (!this.eat(']')) {
        list.push(this.value());
        this.eat(',');
      }
      return list;
    }
    if (x.value === '{') {
      const obj = {};
      while (!this.eat('}')) {
        const key = this.name();
        this.need(':');
        obj[key] = this.value();
        this.eat(',');
      }
      return obj;
    }
    if (x.value === 'true') return true;
    if (x.value === 'false') return false;
    return x.value;
  }
}

module.exports = { Parser };
