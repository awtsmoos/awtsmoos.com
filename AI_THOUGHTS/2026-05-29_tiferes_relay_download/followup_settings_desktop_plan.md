B"H
# Followup Plan: Public /ai URL, Settings Polish, Desktop Conversations

Observed from screenshots and code:
- Installer commands point to `/geelooy/ai/...`, but public static route should be `/ai/...`.
- `openConversationDrawer()` intentionally only applies mobile scenes; on desktop it clears scenes and therefore the Settings button says it opened but nothing visible happens if the left rail is collapsed.
- Settings body calls `providerArchiveFields(this.providerGroups)`, which renders every saved MiniMax/OpenRouter/Groq chat row in Settings. Settings should expose download/import/clear tools only, not a long chat table.
- The right-menu dropdown currently opens as a huge stack covering the content; it needs a cleaner jewel-like command palette.

Concrete edits, all as whole-file rewrites:
1. `panelMarkup.js`: switch absolute install URLs to `https://awtsmoos.com/ai/...`, compact provider controls in Settings, richer relay language.
2. `install-awtsmoos-chatgpt-relay.ps1` and `.sh`: download relay from `https://awtsmoos.com/ai/relay/chatgpt-node-relay.cjs`.
3. `mobileDrawers.js`: desktop open conversation drawer expands the sidebar rail by triggering the real panel toggle when collapsed; mobile behavior stays scene-based.
4. `automation.css`: full visual polish for settings cards, compact popover tabs, better buttons and spacing.
5. `relay-install.css`: deeper styling for installer cards.
6. Verify JS syntax, PowerShell syntax, markup URL strings, and desktop drawer behavior by static/import checks.
