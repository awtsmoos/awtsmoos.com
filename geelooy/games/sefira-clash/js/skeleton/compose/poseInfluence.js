/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function influence(point,dx=0,dy=0,weight=1,priority=0,reason=''){return{point,dx,dy,weight,priority,reason}}
export function influenceSet(reason='',items=[]){return{reason,items}}
