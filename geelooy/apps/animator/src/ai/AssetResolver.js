// B"H
export class AssetResolver { static resolve(name = '') { const n = name.toLowerCase(); if (n.includes('apple')) return 'apple'; if (n.includes('carrot')) return 'carrot'; if (n.includes('plate')) return 'plate'; return 'human'; } }
