B"H

# Mockup gap implementation plan

User asked to do it all step by step from the mockup explanation.

Observed target from the generated design conversation:
- Home and Email should feel like a clean operating-system social app.
- Missing pieces: visual tokens, shared components, responsive phone rules, email layout, home hero/world cards, profile card layout, heichel banner/cards, create editor, bottom nav consistency, empty states, tests, browser checks.

Work nodes for this pass:
1. Add shared mockup-system primitives: tokens, app shell, surface, dock, cards, empty states, forms, motion.
2. Import mockup-system into Home, Email, Profile, Heichel, Create.
3. Rewrite Home key modules to match mockup: large clean hero, search, world cards, feed, dock.
4. Rewrite Email key modules to match mockup: mail OS frame, compact inbox, readable chat, dock.
5. Rewrite Profile key modules: compact identity card, stats, tabs, cards.
6. Rewrite Heichel spaces/cards and create editor with shared system.
7. Verify broad contract suites.
8. Try live browser/screenshot if Chrome cooperates.

No partial patch. Whole files only.
