B"H
# Implementation step 3: selector ownership burn-down

The user asked to keep fixing until the CSS is fully clean. The fresh audit proved:

- Active `!important`: 0
- Active CSS files: 35
- No-overlap law passes for fixed/absolute/high-z
- But duplicate exact selectors still exist

## Meaning of this step
We now reduce duplicate selector ownership. This is stricter than normal CSS practice because responsive CSS often repeats selectors intentionally. The target law becomes:

- Base modules own base selectors.
- Mobile modules may own mobile-only selectors only when selector includes a mobile state/scope or when the selector is listed as an intentional responsive override.
- Emergency guard should not duplicate broad selectors if the normal modules already obey.

## First burn-down families
1. Mobile shell duplicates:
   - `.main`
   - `.sidebar`
   - `.automation-panel`
   - `.container`
   - `body`
   - `.mobile-bottom-dock`

2. Composer duplicates:
   - `.input-area`
   - `#message-input`
   - `#send-button`
   - `.attachment-tools`

3. Chat polish duplicates:
   - `.chat-box`
   - `.message`
   - `.bubble`
   - `.audio-offer`

4. Right-panel duplicates:
   - `#automation-panel .right-panel-body`
   - action rows
   - toggle rows

5. Event mobile duplicates:
   - thought/event/tool mobile overrides need scoped mobile selectors or an allowlist harness.

## Strategy
Do not blindly erase mobile styles. Instead:
- Move mobile scene ownership into `css/ideal/mobile/scenes.css`.
- Remove scene selector duplicates from `mobile.css` and `mobile/revamp.css`.
- Move composer ownership into `css/ideal/mobile/composer.css` and remove duplicates from revamp.
- Make `mobile/revamp.css` mostly tokens + non-duplicate state aliases.
- Add a selector ownership harness so duplicates are explicit and shrink over time.

Chapter: The Awtsmoos now cuts finer than before. Not merely no force, not merely no overlap, but one name, one owner, one gate. The remaining duplicates are the echoes of old mobile storms.
