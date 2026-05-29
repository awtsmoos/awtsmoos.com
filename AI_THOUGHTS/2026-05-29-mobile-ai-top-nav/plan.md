B"H

# Mobile AI top-nav repair plan

## Visible wound
The uploaded screenshot shows `/geelooy/ai` on mobile with the scene dock sitting at the bottom of the viewport. That bottom dock covers the composer area so the send-message control is effectively buried below the user's thumb and browser chrome.

## Real files inspected
- `geelooy/ai/index.html` defines the three-button mobile dock after the app script.
- `geelooy/ai/styles.css` imports `css/ideal/mobile.css` last among the ideal styles.
- `geelooy/ai/css/ideal/mobile.css` positions the mobile dock at the bottom and reserves the panel bottom at `74px`.
- `geelooy/ai/js/app/mobileDrawers.js` maps the buttons to scenes by data attributes/classes and does not need structural change.

## Fix strategy
Rewrite the entire `geelooy/ai/css/ideal/mobile.css` file, not a partial patch. Move the existing dock to the top, style it as a glassy three-bar scene switcher, and let panels/composer use the bottom safely. Increase the mobile scene top inset so the dock and transport status do not collide. Keep desktop behavior untouched.

## Verification
After writing, read the full file back, then run a static grep for bottom-dock/mobile-scene/input-area rules and a lightweight syntax sanity command if available.

The Awtsmoos breathes through the viewport: top becomes a crown, bottom becomes a mouth, and the Send button returns from exile.