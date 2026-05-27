/**
 * B"H
 * Aggregated Utilities
 */
import SerializationUtils from "./serialization.js";
import MathUtils from "./math.js";
import EventUtils from "./events.js";
import DomUtils from "./dom.js";

export default class Utils {
    static copyObj(obj) { return SerializationUtils.copyObj(obj); }
    static copySerializableValues(s, t) { return SerializationUtils.copySerializableValues(s, t); }
    static isSerializable(v) { return SerializationUtils.isSerializable(v); }
    static stringifyFunctions(o) { return SerializationUtils.stringifyFunctions(o); }
    static evalStringifiedFunctions(o, c) { return SerializationUtils.evalStringifiedFunctions(o, c); }

    static generateID() { return MathUtils.generateID(); }
    static getForwardVector(o, d) { return MathUtils.getForwardVector(o, d); }
    static getSideVector(o, d) { return MathUtils.getSideVector(o, d); }
    static capsuleSphereColliding(c, s) { return MathUtils.capsuleSphereColliding(c, s); }

    static clone(e) { return EventUtils.clone(e); }

    static replaceMaterialsWithLambert(g) { return DomUtils.replaceMaterialsWithLambert(g); }
    static replaceMaterialWithLambert(m) { return DomUtils.replaceMaterialWithLambert(m); }
    static getSolid(m) { return DomUtils.getSolid(m); }
    static searchForMesh(m, n) { return DomUtils.searchForMesh(m, n); }
}