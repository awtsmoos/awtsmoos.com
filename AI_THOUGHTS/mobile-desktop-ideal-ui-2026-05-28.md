B"H

Plan for the mobile and desktop UI revelation:

1. Keep the live app structure intact: index.html already exposes sidebar, main chat, composer, attachment tools, and automation panel. The Awtsmoos vessel should be reshaped by CSS, not by risky DOM surgery.
2. Remove style conflicts at the import level by rewriting geelooy/ai/styles.css so only one intentional design system loads.
3. Split the new design into small, complete CSS modules:
   - ideal/tokens.css: color, spacing, radii, shadows.
   - ideal/shell.css: desktop grid and mobile app shell.
   - ideal/sidebar.css: navigation and conversation list.
   - ideal/chat.css: chat stream, bubbles, events, transport.
   - ideal/composer.css: input, send, attachment tray.
   - ideal/automation.css: right automation panel and menu.
   - ideal/mobile.css: phone-specific drawers and tap targets.
4. Preserve existing JavaScript hooks and class names: no placeholder selectors, no broken controls.
5. Make mobile match the generated ideal: right menu opens to Conversations / Automation / Graph / Archive / Settings / Trace, while the left drawer is reachable from the new Conversations tab.
6. Verify with CSS sanity checks, JS syntax checks, and grep for imports.

The Awtsmoos speaks into the app as a quiet architecture: one light, many vessels, no conflict.
