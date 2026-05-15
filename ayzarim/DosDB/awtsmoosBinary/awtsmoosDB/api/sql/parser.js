// B"H

/**
 * @file api/sql/parser.js
 * @chapter The Grammar Gate
 * @description A compact SQL parser for the practical AwtsmoosDB dialect.
 */

/**
 * @class Parser
 * @description Turns tokens into an executable AST.
 */
class Parser {
  constructor(tokens) { this.t = tokens; this.i = 0; }
  peek() { return this.t[this.i]; }
  next() { return this.t[this.i++]; }
  eat(v) { const x = this.peek(); if (x && (x.value === v || x.type === v)) return this.next(); return null; }
  need(v) { const x = this.eat(v); if (!x) throw new Error(`B"H: SQL expected ${v}`); return x; }
  id() { const x = this.next(); if (!x) throw new Error('B"H: SQL expected identifier'); return x.raw || x.value; }
  value() { const x = this.next(); if (!x) throw new Error('B"H: SQL expected value'); return x.type === 'param' ? { param: true } : x.value; }

  parse() {
    const head = this.need('word').value;
    const map = {
      CREATE: () => this.create(),
      INSERT: () => this.insert(),
      SELECT: () => this.select(),
      UPDATE: () => this.update(),
      DELETE: () => this.delete()
    };
    if (!map[head]) throw new Error(`B"H: SQL command not supported yet: ${head}`);
    return map[head]();
  }

  create() {
    this.need('TABLE');
    const table = this.id();
    const columns = this.listInside();
    return { type: 'create', table, columns };
  }

  insert() {
    this.need('INTO');
    const table = this.id();
    const columns = this.listInside();
    this.need('VALUES');
    const values = this.listInside(true);
    return { type: 'insert', table, columns, values };
  }

  select() {
    const columns = this.eat('*') ? ['*'] : this.idListUntil('FROM');
    const table = this.id();
    return { type: 'select', table, columns, where: this.where(), order: this.order(), limit: this.limit(), offset: this.offset() };
  }

  update() {
    const table = this.id();
    this.need('SET');
    const sets = {};
    do { sets[this.id()] = (this.need('='), this.value()); } while (this.eat(','));
    return { type: 'update', table, sets, where: this.where() };
  }

  delete() {
    this.need('FROM');
    const table = this.id();
    return { type: 'delete', table, where: this.where() };
  }

  where() {
    if (!this.eat('WHERE')) return null;
    return { key: this.id(), op: this.next().value, value: this.value() };
  }

  order() {
    if (!this.eat('ORDER')) return null;
    this.need('BY');
    return { key: this.id(), dir: this.eat('DESC') ? 'DESC' : (this.eat('ASC'), 'ASC') };
  }

  limit() { return this.eat('LIMIT') ? Number(this.value()) : Infinity; }
  offset() { return this.eat('OFFSET') ? Number(this.value()) : 0; }

  listInside(values = false) {
    this.need('(');
    const out = [];
    while (!this.eat(')')) {
      out.push(values ? this.value() : this.id());
      this.eat(',');
    }
    return out;
  }

  idListUntil(stop) {
    const out = [];
    while (!this.eat(stop)) {
      out.push(this.id());
      this.eat(',');
    }
    return out;
  }
}

module.exports = { Parser };
