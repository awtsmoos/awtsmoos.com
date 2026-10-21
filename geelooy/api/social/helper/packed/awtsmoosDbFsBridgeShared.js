//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module awtsmoosDbFsBridgeShared
 * @description
 * Shared-bridge singleton cache: one bridge per DB file per process.
 */

// Fixes: import worker writes invisible to web handler (separate DB instances with exclusive locks)
const _bridgeCache = new Map();
function getSharedBridge(dbFile, rootPrefix) {
  const key = dbFile + "|" + (rootPrefix || "/");
  if (!_bridgeCache.has(key)) {
    _bridgeCache.set(key, new AwtsmoosDbFsBridge({ dbFile, rootPrefix }));
  }
  return _bridgeCache.get(key);
}

module.exports = {
	_bridgeCache,
	getSharedBridge
};

const { AwtsmoosDbFsBridge } = require('./awtsmoosDbFsBridgeClass.js');
