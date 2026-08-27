
// B"H
/**
 * @file pathSimplifier.js
 * @brief Ramer-Douglas-Peucker simplification.
 */

function distPointToLine(p, a, b) {
    const x = p[0], y = p[1];
    const x1 = a[0], y1 = a[1];
    const x2 = b[0], y2 = b[1];

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = x1; yy = y1;
    } else if (param > 1) {
        xx = x2; yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

export function simplifyPath(points, epsilon) {
    if (points.length < 3) return points;

    let dmax = 0;
    let index = 0;
    const end = points.length - 1;

    for (let i = 1; i < end; i++) {
        const d = distPointToLine(points[i], points[0], points[end]);
        if (d > dmax) {
            index = i;
            dmax = d;
        }
    }

    let resultList = [];

    if (dmax > epsilon) {
        const recResults1 = simplifyPath(points.slice(0, index + 1), epsilon);
        const recResults2 = simplifyPath(points.slice(index), epsilon);

        resultList = recResults1.slice(0, recResults1.length - 1).concat(recResults2);
    } else {
        resultList = [points[0], points[end]];
    }

    return resultList;
}
