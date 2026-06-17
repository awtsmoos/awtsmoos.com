/* B"H
Additive synthesis stacks tiny candles until a tone becomes a sunrise.
*/
export function additivePartials(kind='ep') { return kind==='organ' ? [[1,1],[2,.7],[3,.5],[4,.35]] : [[1,1],[2,.28],[3,.42],[5,.18],[8,.08]]; }
