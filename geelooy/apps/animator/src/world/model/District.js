// B"H
import { Group } from './Group.js';
/** District: authored world neighborhood, room, kitchen, park, school. */
export class District extends Group { constructor(opts = {}) { super({ ...opts, props: { ...(opts.props || {}), level: 'district' } }); this.kind = 'district'; } }
