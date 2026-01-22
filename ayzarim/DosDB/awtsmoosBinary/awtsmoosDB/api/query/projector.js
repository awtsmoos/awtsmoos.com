// B"H
class Projector {
    constructor(evaluator) {
        this.evaluator = evaluator;
    }

    project(item, mapSpec) {
        if (!mapSpec) return item;
        if (mapSpec === true) {
             if (item && item.reader) return item.reader.resolveSelf();
             return item;
        }
        const result = {};
        for (const key in mapSpec) {
            const rule = mapSpec[key];
            if (rule === true) {
                result[key] = this.evaluator._resolvePath(item, key);
            }
            else if (typeof rule === 'string') {
                result[key] = this.evaluator._resolvePath(item, rule);
            }
            else if (typeof rule === 'object') {
                if (rule.$check) result[key] = this.evaluator.evaluate(item, rule.$check);
                else if (rule.$value) result[key] = rule.$value; 
                else {
                    const subItem = this.evaluator._resolvePath(item, key);
                    result[key] = this.project(subItem, rule);
                }
            }
        }
        return result;
    }
}
module.exports = Projector;