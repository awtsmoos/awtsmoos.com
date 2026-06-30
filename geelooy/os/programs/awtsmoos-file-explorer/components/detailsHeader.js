// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
export default function detailsHeader() { return createElement({ tag:'div', attributes:{ class:'details-header', role:'row' }, children:['Name','Type','Mount','Permission','Size / Status'].map(text => ({ tag:'span', attributes:{ role:'columnheader' }, text })) }); }
/** B"H: The header crowns the list so rows know their names. */
