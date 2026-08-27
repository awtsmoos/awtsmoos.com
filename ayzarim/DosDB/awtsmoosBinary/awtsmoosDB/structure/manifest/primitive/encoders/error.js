// B"H

/**
 * @file structure/manifest/primitive/encoders/error.js
 * @chapter The Broken Cry Receives A Name
 * @description
 * JavaScript Error fields like name, message, stack, cause, and
 * AggregateError.errors are not normal enumerable object keys. This encoder
 * saves their revealed identity as exact JSON bytes under VAL_TYPE.ERROR.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function snapshotValue
 * @description
 * Converts nested error causes into plain data while leaving ordinary causes
 * intact when JSON can carry them.
 *
 * @param {*} value - Cause or nested error value.
 * @returns {*} JSON-safe value.
 */
function snapshotValue(value) {
  if (value instanceof Error) return snapshotError(value);
  return value;
}

/**
 * @function snapshotError
 * @description
 * Captures the standard error identity.
 *
 * @param {Error} error - Error instance.
 * @returns {object} Serializable error record.
 */
function snapshotError(error) {
  const record = {
    __awtsmoosError: true,
    name: error.name || error.constructor.name || 'Error',
    message: error.message || '',
    stack: error.stack || ''
  };

  if ('cause' in error) {
    record.cause = snapshotValue(error.cause);
  }

  if (error instanceof AggregateError) {
    record.errors = Array.from(error.errors || []).map(snapshotValue);
  }

  return record;
}

/**
 * @function encodeError
 * @description
 * Encodes Error and AggregateError values.
 *
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeError(value) {
  if (!(value instanceof Error)) return null;

  return new Packet(
    TYPE.ERROR,
    Buffer.from(JSON.stringify(snapshotError(value)), 'utf8')
  );
}

module.exports = encodeError;
