// B"H
export class TableInteraction { static place(id, x, y) { return { type: 'prop', id, action: 'place', to: { x, y }, lifecycle: 'placed' }; } }
