// B"H
import { BookPropRenderer } from './BookPropRenderer.js';import { SoupPropRenderer } from './SoupPropRenderer.js';import { CupPropRenderer } from './CupPropRenderer.js';import { PlatePropRenderer } from './PlatePropRenderer.js';
export class ProductionPropLibrary { static build(p={}){const t=p.type||p.propType||'';if(/book|sefer/i.test(t))return BookPropRenderer.build(p);if(/soup/i.test(t))return SoupPropRenderer.build(p);if(/cup|tea/i.test(t))return CupPropRenderer.build(p);if(/plate|bread|sandwich/i.test(t))return PlatePropRenderer.build(p);return null;} }
