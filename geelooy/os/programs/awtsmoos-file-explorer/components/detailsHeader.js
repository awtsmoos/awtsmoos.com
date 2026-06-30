// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
const COLUMNS = ['Name','Type','Mount','Permission','Size / Status'];
export default function detailsHeader() { return createElement({ tag:'div', attributes:{ class:'details-header xp-raised', role:'row', 'data-xp-role':'details-header', 'data-xp-frame':'raised' }, children:COLUMNS.map((text, index) => ({ tag:'span', attributes:{ role:'columnheader', 'data-column-index':String(index), tabindex:'0' }, text })) }); }
/** B"H: Details headers are focusable XP ridges ready for resize/sort. */
