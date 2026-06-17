// B"H
export function colliderReport(colliders = []) { return { total:colliders.length, mirrored:colliders.filter(c => c.exactTransformMirror).length, byShape:colliders.reduce((a,c)=>{ a[c.shape]=(a[c.shape]||0)+1; return a; }, {}) }; }
