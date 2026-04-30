
// B"H
/**
 * @file index.js (Map Key Logic)
 */
const constants = require('../../../../../constants.js');

class MapSeekerWrapper {
    static seek(db, type, coords, key) {
        const T = constants.VAL_TYPE;
        if (type === T.MAP || type === T.JS_MAP) {
            const Seeker = require('../../../../../structure/map/seeker.js');
            return Seeker.get(db, coords, key);
        }
        const Seeker = require('../../../../../structure/dictionary/seeker.js');
        return Seeker.get(db, coords, key);
    }
}

module.exports = MapSeekerWrapper;
