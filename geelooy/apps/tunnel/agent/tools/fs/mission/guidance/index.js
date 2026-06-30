// B"H
const Facts = require('./facts.js');
const Situations = require('./situations.js');
const Phrases = require('./phrases.js');
const Compose = require('./compose.js');
const Render = require('./render.js');

/** B"H — The guidance engine: facts in, calm useful English out. */
module.exports = { ...Facts, ...Situations, ...Phrases, ...Compose, ...Render };
