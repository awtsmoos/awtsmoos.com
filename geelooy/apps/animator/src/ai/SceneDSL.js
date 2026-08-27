// B"H
export class SceneDSL { constructor() { this.commands = []; } add(type, options) { this.commands.push({ type, options }); return this; } }
