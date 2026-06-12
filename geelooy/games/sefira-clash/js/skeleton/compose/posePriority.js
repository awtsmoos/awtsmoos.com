/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export const PRIORITY={base:0,contact:10,locomotion:20,air:30,emotion:40,combat:50,damage:60,secondary:70,ik:80};
export function byPriority(a,b){return(a.priority||0)-(b.priority||0)}
