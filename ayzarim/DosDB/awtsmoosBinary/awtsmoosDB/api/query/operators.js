// B"H
const ops = {
    $eq: (a, b) => a === b,
    $ne: (a, b) => a !== b,
    $gt: (a, b) => typeof a === 'number' && a > b,
    $gte: (a, b) => typeof a === 'number' && a >= b,
    $lt: (a, b) => typeof a === 'number' && a < b,
    $lte: (a, b) => typeof a === 'number' && a <= b,
    $in: (a, b) => Array.isArray(b) && b.includes(a),
    $nin: (a, b) => Array.isArray(b) && !b.includes(a),
    $contains: (a, b) => (typeof a === 'string' || Array.isArray(a)) && a.includes(b),
    $regex: (a, b) => {
        try { return new RegExp(b).test(String(a)); } catch(e) { return false; }
    },
    $exists: (a, b) => (a !== undefined) === b
};
module.exports = ops;
