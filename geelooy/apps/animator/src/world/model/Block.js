// B"H
import { Group } from './Group.js';
/** Block: a named unit inside a district. */
export class Block extends Group { constructor(opts = {}) { super({ ...opts, props: { ...(opts.props || {}), level: 'block' } }); this.kind = 'block'; } }
