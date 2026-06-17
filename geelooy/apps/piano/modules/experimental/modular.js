/* B"H
The modular matrix is the wild permission: any river may feed any sea.
*/
export class ModMatrix { constructor(){this.routes=[];} connect(source,target,amount=1){this.routes.push({source,target,amount});} apply(t){this.routes.forEach(r=>r.target?.(r.source?.(t)*r.amount));} }
