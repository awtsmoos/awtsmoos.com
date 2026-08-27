
// B"H
/**
 * @file api/liveHandle/reader/logic/rehydratorDispatcher.js
 * @description
 * Chapter 55: The Registry of Restoration.
 * Each structure ID is mapped to a specific angelic scribe to pull the data
 * into living JS memory instantly.
 */
const constants = require('../../../../constants.js');
const SequenceEngine = require('../../../../structure/sequence/index.js');
const DictionaryEngine = require('../../../../structure/dictionary/index.js');
const MapEngine = require('../../../../structure/map/index.js');
const FlatObject = require('../../../../structure/flat/object/index.js');
const FlatArray = require('../../../../structure/flat/array/index.js');

const T = constants.VAL_TYPE;

const STRATEGY_MAP = {
    [T.SEQUENCE]: SequenceEngine,
    [T.ARRAY]: SequenceEngine,
    [T.SET]: SequenceEngine,
    [T.JS_SET]: SequenceEngine,
    [T.DICTIONARY]: DictionaryEngine,
    [T.OBJECT]: DictionaryEngine,
    [T.MAP]: MapEngine,
    [T.JS_MAP]: MapEngine,
    [T.SMART_OBJECT]: FlatObject,
    [T.SMART_ARRAY]: FlatArray
};

module.exports = {
    getEngineClass(type) {
        return STRATEGY_MAP[type] || null;
    }
};
