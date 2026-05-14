// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/error.js
 * @chapter The Cry Returns With Its Face
 * @description
 * Rehydrates serialized Error records into their closest standard JavaScript
 * subclasses, preserving message, cause, stack, and AggregateError children.
 */

const ERROR_CTORS = {
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  AggregateError
};

/**
 * @function reviveValue
 * @description
 * Revives nested error snapshots and leaves ordinary JSON values alone.
 *
 * @param {*} value - Serialized value.
 * @returns {*} Revived value.
 */
function reviveValue(value) {
  if (value && value.__awtsmoosError) return reviveRecord(value);
  return value;
}

/**
 * @function reviveRecord
 * @description
 * Converts one serialized error record into an Error instance.
 *
 * @param {object} record - Serialized error record.
 * @returns {Error} Error instance.
 */
function reviveRecord(record) {
  const name = record.name || 'Error';
  const Ctor = ERROR_CTORS[name] || Error;
  const hasCause = Object.prototype.hasOwnProperty.call(record, 'cause');
  const cause = hasCause ? reviveValue(record.cause) : undefined;

  let error;
  if (name === 'AggregateError') {
    const errors = Array.isArray(record.errors)
      ? record.errors.map(reviveValue)
      : [];
    error = new AggregateError(errors, record.message || '');
  } else {
    error = new Ctor(record.message || '');
  }

  error.name = name;
  if (hasCause) error.cause = cause;
  if (record.stack) error.stack = record.stack;

  return error;
}

/**
 * @function reviveError
 * @description
 * Hydrates an Error from JSON bytes.
 *
 * @param {Buffer} buffer - Stored bytes.
 * @returns {Error} Error instance.
 */
function reviveError(buffer) {
  try {
    return reviveRecord(JSON.parse(buffer.toString('utf8')));
  } catch (_err) {
    return new Error(buffer.toString('utf8'));
  }
}

module.exports = reviveError;
