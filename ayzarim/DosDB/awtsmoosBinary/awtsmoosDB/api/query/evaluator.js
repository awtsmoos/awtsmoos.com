
// B"H
const operators = require('./operators.js');
const keyEncoding = require('../../utils/keyEncoding.js');

class FilterEvaluator {
    constructor(db) {
        this.db = db;
    }

    async evaluate(item, criteria) {
        if (!criteria) return true;
        if (criteria.$and) {
            for (const sub of criteria.$and) if (!(await this.evaluate(item, sub))) return false;
            return true;
        }
        if (criteria.$or) {
            for (const sub of criteria.$or) if (await this.evaluate(item, sub)) return true;
            return false;
        }
        if (criteria.$not) return !(await this.evaluate(item, criteria.$not));
        
        // B"H: Handle Top-Level Graph Query
        if (criteria.$relatedTo) {
             const match = await this._checkGraphRelationship(item, criteria.$relatedTo);
             if (!match) return false;
        }

        for (const key in criteria) {
            if (key.startsWith('$')) continue;
            const condition = criteria[key];
            const value = await this._resolvePath(item, key);

            // B"H: Debug match failure
            // if (key === 'name' && value === 'Bob') console.log(`B"H Evaluator Matched Bob!`);

            if (condition && typeof condition === 'object' && condition.$relatedTo) {
                const match = await this._checkGraphRelationship(item, condition.$relatedTo);
                if (!match) return false;
                continue;
            }
            if (!this._compare(value, condition)) {
                // console.log(`B"H Evaluator Mismatch: Key=${key} Val=${value} Cond=${JSON.stringify(condition)}`);
                return false;
            }
        }
        return true;
    }

    async _resolvePath(item, path) {
        if (!item) return undefined;
        if (path.indexOf('.') === -1) return this._getValue(item, path);
        const parts = path.split('.');
        let current = item;
        for (const part of parts) {
            current = await this._getValue(current, part);
            if (current === undefined || current === null) return undefined;
        }
        return current;
    }

    async _getValue(obj, key) {
        // B"H: Robust check for LiveHandle
        if (obj && obj.isLiveHandle) {
            // 1. Try Structural Navigation (Map/Dict/Seq)
            const childHandle = obj.nav.navigate(key);
            await childHandle.ensureResolved(); // Check if valid pointer exists
            
            // Note: `await` on a LiveHandle automatically triggers `then()` which calls `resolveSelf()`.
            if (childHandle.ptr) {
                 return await childHandle.reader.resolveSelf();
            }
            
            // 2. Fallback: If navigation failed (e.g., obj is a TYPE_JSON blob), 
            // resolve the object itself and access the property directly.
            const resolvedObj = await obj.reader.resolveSelf();
            if (resolvedObj && typeof resolvedObj === 'object') {
                return resolvedObj[key];
            }
            
            return undefined;
        }
        return obj[key];
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

    async _checkGraphRelationship(sourceHandle, criteria) {
        // B"H: Safety Check - if sourceHandle is not a LiveHandle, it has no graph identity.
        if (!sourceHandle || !sourceHandle.isLiveHandle) return false;

        const direction = criteria.direction || 'BOTH';
        const label = criteria.label || null;
        
        if (!sourceHandle.relationships) {
            return false;
        }
        
        const edges = await sourceHandle.relationships(direction, label);
        
        if (!criteria.match) return edges.length > 0;
        
        for (const edge of edges) {
            const targetNode = edge.node;
            if (await this.evaluate(targetNode, criteria.match)) {
                return true;
            }
        }
        return false;
    }
}
module.exports = FilterEvaluator;