B"H

# User screenshot fast fix plan

The uploaded screenshots show the redesign is objectively too heavy and broken:
- duplicate top navs / duplicate hamburger buttons
- only one menu works
- choppy performance from too much blur, particles, hover transforms, animations
- cards too tall and background too noisy
- empty state still has old ugly links/buttons
- dock covers content and page feels like stacked heavy glass

Step by step fix:
1. Inspect actual Home markup and nav wrapper to see where duplicate topbars come from.
2. Prefer hiding the older global header only on the Geelooy home if the page provides its own mobile app bar.
3. Kill the heavy animation/blur/particle layers globally for the redesigned pages.
4. Replace home CSS with a much simpler, faster mobile-first system: flat surfaces, smaller hero, no speckles, no huge cards.
5. Fix empty state links to look like buttons and reduce the feed height.
6. Make quick action grid compact and readable.
7. Verify tests and CSS asset loads.
8. If possible render a new mobile screenshot.

No partial patching: rewrite whole CSS modules and only full-file route rewrite if needed.
