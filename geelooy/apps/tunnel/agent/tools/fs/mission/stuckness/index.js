// B"H
const D = require('./detect.js'); const R = require('./recover.js');
function apply(lock, next) { const got = D.detect(lock, next); lock.lastNextKey = got.key; lock.repeatCount = got.count; if (got.stuck) lock.lastMustCallNext = R.next(lock); return { lock, stuck: got.stuck }; }
module.exports = { apply, detect: D.detect, recoverNext: R.next };
