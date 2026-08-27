// B"H
/** @file colliderMerge.js @description Future geometry merge helper contract. */
export function colliderMergePlan(items=[]){return {items:items.length,vertices:items.length*8,triangles:items.length*12,mode:'box-merge-contract'};}
