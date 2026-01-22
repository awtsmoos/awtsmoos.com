// B"H
/**
 * @file evaluator.js
 * @description Synchronous Filter Evaluation.
 */
const operators = require('./operators.js');
const constants = require('../../constants.js');

class FilterEvaluator {
    constructor(db) {
        this.db = db;
    }

    evaluate(item, criteria) {
        if (!criteria) return true;
        if (criteria.$and) {
            for (const sub of criteria.$and) if (!this.evaluate(item, sub)) return false;
            return true;
        }
        if (criteria.$or) {
            for (const sub of criteria.$or) if (this.evaluate(item, sub)) return true;
            return false;
        }
        if (criteria.$not) return !this.evaluate(item, criteria.$not);
        
        if (criteria.$relatedTo) {
             const match = this._checkGraphRelationship(item, criteria.$relatedTo);
             if (!match) return false;
        }

        for (const key in criteria) {
            if (key.startsWith('$')) continue;
            const condition = criteria[key];
            const value = this._resolvePath(item, key);

            if (condition && typeof condition === 'object' && condition.$relatedTo) {
                const match = this._checkGraphRelationship(item, condition.$relatedTo);
                if (!match) return false;
                continue;
            }
            if (!this._compare(value, condition)) {
                return false;
            }
        }
        return true;
    }

    _resolvePath(item, path) {
        if (!item) return undefined;
        if (path.indexOf('.') === -1) return this._getValue(item, path);
        const parts = path.split('.');
        let current = item;
        for (const part of parts) {
            current = this._getValue(current, part);
            if (current === undefined || current === null) return undefined;
        }
        return current;
    }

    _getValue(obj, key) {
        const h = obj && obj[constants.SYMBOLS.INTERNALS] ? obj[constants.SYMBOLS.INTERNALS] : obj;
        
        if (h && h.isLiveHandle) {
            // Structural Navigation
            const childHandle = h.nav.navigate(key);
            const childInt = childHandle[constants.SYMBOLS.INTERNALS];
            childInt.ensureResolved(); 
            
            if (childInt.ptr) {
                 return childInt.reader.resolveSelf();
            }
            
            // Fallback to hydrated access
            const resolvedObj = h.reader.resolveSelf();
            if (resolvedObj && typeof resolvedObj === 'object') {
                return resolvedObj[key];
            }
            
            return undefined;
        }
        return obj ? obj[key] : undefined;
    }

    _compare(value, condition) {
        if (typeof condition !== 'object' || condition === null) return value === condition;
        for (const op in condition) {
            if (operators[op]) {
                if (!operators[op](value, condition[op])) return false;
            } else if (op.startsWith('$')) {
                return false;
            } else {
                if (JSON.stringify(value) !== JSON.stringify(condition)) return false;
            }
        }
        return true;
    }

    _checkGraphRelationship(sourceHandle, criteria) {
        const h = sourceHandle && sourceHandle[constants.SYMBOLS.INTERNALS] ? sourceHandle[constants.SYMBOLS.INTERNALS] : sourceHandle;
        if (!h || !h.isLiveHandle) return false;

        const direction = criteria.direction || 'BOTH';
        const label = criteria.label || null;
        
        const edges = this.db.graph.getRelationships(h, direction, label);
        
        if (!criteria.match) return edges.length > 0;
        
        for (const edge of edges) {
            const targetNode = edge.node;
            if (this.evaluate(targetNode, criteria.match)) {
                return true;
            }
        }
        return false;
    }
}
module.exports = FilterEvaluator;