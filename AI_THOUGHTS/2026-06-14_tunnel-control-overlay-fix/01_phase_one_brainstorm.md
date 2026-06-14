B"H

Phase one: overlay and console fire.
Visible symptoms:
- Command palette sits over everything and has no close affordance visible.
- Console repeats TypeError: Cannot set property children of #<Element> which has only a getter at dom.js:14 from live.js render/sample/card.
- Console also shows fs calls without tunnelName, causing 400s.

Likely fixes:
- Inspect dom helper signatures. A helper may copy props blindly and assign children property to HTMLElement.
- Inspect command palette modules and close behavior.
- Rewrite whole files only.
