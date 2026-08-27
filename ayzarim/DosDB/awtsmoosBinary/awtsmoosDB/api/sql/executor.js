// B"H

/**
 * @file api/sql/executor.js
 * @chapter Tables In The Root Garden
 * @description Executes parsed SQL against AwtsmoosDB records.
 */

/**
 * @class SQLExecutor
 * @description Applies AST commands to the database.
 */
class SQLExecutor {
  constructor(db) {
    this.db = db;
    this.fresh = new Map();
  }

  run(ast, params = []) {
    this.params = params.slice();
    const fns = {
      create: (a) => this.create(a),
      insert: (a) => this.insert(a),
      select: (a) => this.select(a),
      update: (a) => this.update(a),
      delete: (a) => this.delete(a)
    };
    return fns[ast.type](ast);
  }

  create(ast) {
    return this.handle(ast.table).create(ast.columns);
  }

  insert(ast) {
    const row = {};
    ast.columns.forEach((col, i) => { row[col] = this.val(ast.values[i]); });
    return this.handle(ast.table).insert(row);
  }

  select(ast) {
    const where = this.boundWhere(ast.where);
    return this.handle(ast.table).select({
      columns: ast.columns,
      where,
      order: ast.order,
      limit: ast.limit,
      offset: ast.offset
    });
  }

  update(ast) {
    const where = this.boundWhere(ast.where);
    const sets = Object.fromEntries(Object.keys(ast.sets).map((col) => [col, this.val(ast.sets[col])]));
    return this.handle(ast.table).update(where, sets);
  }

  delete(ast) {
    const where = this.boundWhere(ast.where);
    return this.handle(ast.table).delete(where);
  }

  val(v) { return v && v.param ? this.params.shift() : v; }

  boundWhere(where) {
    return where ? { ...where, value: this.val(where.value) } : null;
  }

  handle(name) {
    return this.db.tables.table(name);
  }
}

module.exports = { SQLExecutor };
