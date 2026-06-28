// B"H
function verify(lock = {}, token = '') { return !!(token && lock.releaseToken && token === lock.releaseToken); }
module.exports = { verify };
