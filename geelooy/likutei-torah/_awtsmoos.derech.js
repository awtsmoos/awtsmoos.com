// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file _awtsmoos.derech.js
 * @description
 * Human-friendly ID mount for likutei-torah: short Hebrew/English paths resolve to
 * canonical reader posts via geelooy/heichelos/routes/friendlyIds/.
 */

'use strict';

const { createFriendlyDerech } = require('../heichelos/routes/friendlyIds/friendlyDerech.js');

module.exports = createFriendlyDerech('likutei-torah');
