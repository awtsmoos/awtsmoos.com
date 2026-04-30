
// B"H
/**
 * @file index.js (Navigator)
 * @chapter The Master of the Path (Chochmah)
 */

const AnchorLogic = require('./anchor/index.js');
const StructuralLogic = require('./structural/index.js');
const KeyLogic = require('./key/index.js');
const NavigationLogic = require('./navigation/index.js');

class Navigator {
    constructor(state) {
        this.state = state;
    }

    resolveAnchorInnerType() {
        return AnchorLogic.resolveInnerType(this.state);
    }

    resolveStructPtr() {
        return StructuralLogic.resolveCoords(this.state);
    }

    resolveKey(key) {
        const coords = this.resolveStructPtr();
        if (!coords) return null;
        return KeyLogic.resolveKey(this.state, key, coords);
    }

    navigate(key, ptr = null, type = null) {
        return NavigationLogic.navigate(this.state, key, ptr, type);
    }
}

module.exports = Navigator;
