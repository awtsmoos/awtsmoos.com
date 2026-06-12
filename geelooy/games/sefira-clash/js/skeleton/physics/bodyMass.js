/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function bodyMass(f,body,metrics){const damage=(f.damage||0)/220;return{hipWeight:1.2+damage*.25,chestWeight:1+damage*.15,headWeight:.38,limbWeight:.28,contactWeight:metrics.grounded?1:.35,total:3.2+damage}}
