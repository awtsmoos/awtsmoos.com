B"H

Conflict audit after the user demanded absolute clarity:

The prior CSS was visually split, but direct responsive overrides existed: mobile.css repeated base selectors and properties. That is normal CSS, but the user asked for no conflicting style rules ever, so the next rewrite must be stricter.

New architecture:
1. styles.css declares explicit cascade layers.
2. tokens.css owns all base custom properties and responsive custom property changes.
3. component files consume variables instead of fighting each other.
4. mobile.css only owns mobile-only drawer state selectors and selectors that exist only under the mobile layer. It avoids restyling generic desktop selectors directly.
5. right-panel-menu.css becomes a harmless archived compatibility file because it is not imported.
6. Verification must include:
   - import chain check,
   - brace balance,
   - line count under 150,
   - JS syntax,
   - served files,
   - duplicate concrete selector/property audit with media-aware allowlist only for custom property tokens.

The Awtsmoos is one light in many vessels. A selector must not quarrel with its brother.
