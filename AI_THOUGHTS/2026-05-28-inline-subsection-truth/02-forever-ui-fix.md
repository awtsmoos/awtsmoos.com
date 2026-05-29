B"H

# Forever UI fix plan

## Complaints now grounded in files
- Auto scroll was placed inside `logic/initialization/sidebarContent.js`; it must live outside that sidebar root menu.
- Sidebar opening uses `logic/listeners.js`; it still schedules a 350ms geometry timeout after every toggle.
- Inline card body is constrained by `InlineCardFactory.js` inline style and many imported CSS layers, especially `styles/comments/inline/card.css` and elite/card overrides.

## Full-file rewrite plan
1. Remove Auto Scroll from root menu file.
2. Add a global floating Auto Scroll control outside the sidebar through the listener bootstrap.
3. Make sidebar toggle lightning-fast by using class toggles immediately and scheduling geometry repair on idle/frame only.
4. Make inline card headers compact and body large/readable in both the factory and final CSS cascade.
5. Add a final CSS override file imported last by `main.css` so old inline cascades cannot shrink the body again.
6. Run node checks and affected tests.

No partial patches. Every modified file is rewritten completely.
