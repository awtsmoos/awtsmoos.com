
// B"H

/**
 * @file test/lightning/fastSuites/probes/scalars.js
 * @chapter The Primitive Sparks Must Return Alive
 * @description
 * This probe is intentionally strict: RegExp must be an actual RegExp,
 * not a dictionary, not an object mask, not dead JSON.
 */

const A = require('../assertions.js');

/**
 * @class ScalarProbe
 * @description Scalar feature probe.
 */
class ScalarProbe {
  /**
   * @method run
   * @description Runs scalar checks.
   * @param {object} db - AwtsmoosDB instance.
   * @returns {void}
   */
  run(db) {
    db.root.scalars = {
      title: 'Awtsmoos lightning',
      count: 7,
      ok: true,
      cosmicId: 12345678901234567890n,
      when: new Date('2026-05-13T00:00:00.000Z'),
      bytes: Buffer.from('B"H'),
      pattern: /Awtsmoos/gi,
      sym: Symbol.for('lightning'),
      fn: x => x + 1,
      typed: new Uint16Array([7, 70])
    };

    A.equal(db.root.scalars.title, 'Awtsmoos lightning', 'string preserved');
    A.equal(db.root.scalars.count, 7, 'number preserved');
    A.equal(db.root.scalars.ok, true, 'boolean preserved');
    A.equal(db.root.scalars.cosmicId, 12345678901234567890n, 'BigInt preserved');
    A.truth(db.root.scalars.when instanceof Date, 'Date resurrected');
    A.equal(db.root.scalars.bytes.toString(), 'B"H', 'Buffer preserved');

    A.truth(db.root.scalars.pattern instanceof RegExp, 'RegExp resurrected as RegExp');
    A.truth(typeof db.root.scalars.pattern.test === 'function', 'RegExp.test exists');
    A.truth(db.root.scalars.pattern.test('AWTSMOOS'), 'RegExp works');

    A.equal(Symbol.keyFor(db.root.scalars.sym), 'lightning', 'Symbol preserved');
    A.equal(db.root.scalars.fn(4), 5, 'Function preserved');
    A.truth(db.root.scalars.typed instanceof Uint16Array, 'TypedArray resurrected');
    A.equal(db.root.scalars.typed[1], 70, 'TypedArray value preserved');
  }
}

module.exports = ScalarProbe;
