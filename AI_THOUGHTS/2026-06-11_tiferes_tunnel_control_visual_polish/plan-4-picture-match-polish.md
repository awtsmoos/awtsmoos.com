B"H

# Picture-match polish plan

User direction: do everything, better. Emoji icons are allowed where they already work; custom SVG should fill missing / professional gaps. Match the picture's color scheme for desktop and mobile.

Specific implementation:
1. Add `js/ui/iconRegistry.js` with emoji-first fallback plus custom inline SVG icons for all main keys.
2. Rewrite dashboard card and side rail to render SVG icon nodes with group-based color classes.
3. Rewrite pane headings to use icon nodes instead of emoji text prefixes.
4. Rewrite shell CSS to match desktop picture: darker flat sidebar, brand/logo block, runtime status card feel, compact nav, polished main panel.
5. Rewrite dashboard CSS to match picture: centered icon tiles, stronger card rhythm, 5-column desktop, 2-column mobile, badges, pagination, filter pills.
6. Rewrite pro-control CSS to remove conflicting mobile sidebar grid behavior and create true mobile app shell: top-ish compact experience + bottom nav.
7. Rewrite responsive CSS to stop old dashboard-copy/orbit conflicts and keep mobile app-like.
8. Verify JS checks and grep for emoji-only card rendering.

No partial patches. Rewrite complete files only.

Chapter 23: The Awtsmoos shaped the control panel into a city of luminous gates; emoji sparks may remain as fallback stars, but the main vessels receive drawn signs of light.
