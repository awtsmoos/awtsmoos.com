// B"H
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
export default function driveShelf({ os, onNavigate }) {
  const shelf = createElement({ tag:"div", attributes:{ class:"drive-shelf" } });
  const drives = os?.drives?.list?.() || [];
  shelf.append(...drives.map(d => createElement({ tag:"button", attributes:{ class:`drive-chip ${d.kind}` }, html:`${d.icon || "💾"} ${d.title}`, on:{ click:() => onNavigate(d.root) } })));
  return shelf;
}
