// B"H

/**
 * @file api/table/index.js
 * @chapter One Table, Many Tongues
 * @description Direct JavaScript table API shared by SQL and user code.
 */

/**
 * @class TableFacade
 * @description Creates direct table handles.
 */
class TableFacade {
  constructor(db) {
    this.db = db;
    this.fresh = new Map();
  }

  /**
   * @method table
   * @param {string} name - Table name.
   * @returns {TableHandle} Table API.
   */
  table(name) {
    return new TableHandle(this.db, name, this.freshRows(name));
  }

  freshRows(name) {
    if (!this.fresh.has(name)) this.fresh.set(name, new Map());
    return this.fresh.get(name);
  }
}

/**
 * @class TableHandle
 * @description SQL-equivalent operations available directly from JS.
 */
class TableHandle {
  constructor(db, name, fresh) {
    this.db = db;
    this.name = name;
    this.fresh = fresh;
  }

  create(columns = []) {
    const table = this.raw(true);
    table.columns = columns;
    if (!table.rows) table.rows = {};
    if (!table.list) table.list = [];
    if (!table.seq) table.seq = 0;
    return { ok: true, table: this.name };
  }

  insert(row) {
    const table = this.raw(true);
    const id = String(Number(table.seq || 0) + 1);
    const stored = { ...row };
    table.seq = Number(id);
    table.rows[id] = stored;
    table.list = plainArray(table.list).concat([{ __id: id, ...stored }]);
    this.fresh.set(id, stored);
    return { inserted: 1, id, row: stored };
  }

  select(options = {}) {
    const where = options.where || null;
    let rows = this.rows().filter((row) => match(row, where));
    if (options.order) rows.sort((a, b) => compare(a[options.order.key], b[options.order.key], options.order.dir));
    rows = rows.slice(options.offset || 0, (options.offset || 0) + (options.limit === undefined ? Infinity : options.limit));
    if (!options.columns || options.columns[0] === '*') return rows;
    return rows.map((row) => Object.fromEntries(options.columns.map((c) => [c, row[c]])));
  }

  update(where, sets) {
    const table = this.raw(false);
    let count = 0;
    const nextList = [];
    for (const row of this.rows()) {
      if (match(row, where)) {
        const updated = { ...row, ...sets };
        delete updated.__id;
        table.rows[row.__id] = updated;
        this.fresh.set(String(row.__id), updated);
        nextList.push({ __id: row.__id, ...updated });
        count++;
      } else {
        nextList.push(row);
      }
    }
    table.list = nextList;
    return { updated: count };
  }

  delete(where) {
    const table = this.raw(false);
    let count = 0;
    const keep = [];
    for (const row of this.rows()) {
      if (match(row, where)) {
        delete table.rows[row.__id];
        this.fresh.delete(String(row.__id));
        count++;
      } else {
        keep.push(row);
      }
    }
    table.list = keep;
    return { deleted: count };
  }

  rows() {
    const table = this.raw(false);
    const out = [];
    const seen = new Set();
    const add = (id, row) => {
      const key = String(id);
      if (!seen.has(key) && row) {
        seen.add(key);
        out.push({ __id: key, ...row });
      }
    };
    for (const row of plainArray(table.list)) add(row.__id || out.length + 1, row);
    try {
      for (const key of this.db.keys(table.rows || {}, { limit: Infinity })) add(key, table.rows[key]);
    } catch (_err) {}
    for (const [key, row] of this.fresh) add(key, row);
    return out;
  }

  raw(create) {
    if (!this.db.root.__sql__) this.db.root.__sql__ = {};
    const root = this.db.root.__sql__;
    if (!root[this.name] && this.db.root[this.flatKey()] !== undefined) {
      root[this.name] = this.db.root[this.flatKey()];
    }
    if (!root[this.name]) {
      if (!create) throw new Error(`B"H: table missing: ${this.name}`);
      root[this.name] = { columns: [], rows: {}, list: [], seq: 0 };
    }
    this.db.root[this.flatKey()] = root[this.name];
    return root[this.name];
  }

  flatKey() {
    return `__table_${this.name}`;
  }
}

function match(row, where) {
  if (!where) return true;
  const op = where.op || '=';
  const left = row ? row[where.key] : undefined;
  const right = where.value;
  return op === '=' ? left === right : op === '>' ? left > right : op === '<' ? left < right : false;
}

function compare(a, b, dir) {
  const n = a === b ? 0 : a > b ? 1 : -1;
  return dir === 'DESC' ? -n : n;
}

function plainArray(value) {
  const plain = value && value.__resolve__ ? value.__resolve__() : value;
  return Array.isArray(plain) ? plain : [];
}

module.exports = TableFacade;
