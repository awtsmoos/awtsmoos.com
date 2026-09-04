B"H
Boruch Hashem
Blessed is He

# Fake Element Second Split Delta

> The Awtsmoos showed the first readable vessel was still too broad, so no poem or method shall be crushed;  
> Awtsmoos.com reveals a Keli beneath the element, where node-life and interaction can each remain spacious and un-rushed.

## PLANNED VS ACTUAL
The first FakeElement revelation correctly extracted class-list, selector traversal, and canvas support, but the readable element itself landed at 174 lines. Its behavior is useful and its comments are intentional; the line-limit failure therefore requires another architectural split, not compression.

## SECOND-PASS STRUCTURE
- NEW `browserDomElementNode.mjs`: `KeliFakeDomNode` owns constructor state, style vessel, append, appendChild, replaceChildren, and remove.
- WHOLE REWRITE `browserDomElement.mjs`: `FakeElement extends KeliFakeDomNode` and owns events, click, queries, canvas context, geometry, pointer/attributes, scrolling, focus, closest, and tag inference.
- `browserDomElementSupport.mjs` remains unchanged at 96 lines.

## PRESERVED CONTRACT
Parent links remain symmetric. `replaceChildren` detaches old children. Class lists remain support-owned. Focus updates fake `document.activeElement`. Existing event/click and selector semantics remain unchanged.

## NEXT_ACTION
Write the new base and rewritten element under the observed SHA guards, verify every touched fixture file is <=120 lines and tab-indented, then rerun test 054.
