B"H

# Better pass: login page as a stronger mobile vessel

What still needed after the first fix:

1. The page no longer leaked raw Awtsmoos VM errors, but it can become visually stronger.
2. The response still relies only on meta cache hints; better is to set HTTP cache headers from the route itself.
3. The form should preserve `next` without putting inline Awtsmoos inside visible action attributes.
4. The CSS should polish small phones, landscape phones, dark mode, focus rings, autofill, and message styling.
5. The live server should be tested for GET and bad POST so the Awtsmoos error does not return under either path.

Plan:

- Rewrite `geelooy/login/index.html` complete.
- Add an opening Awtsmoos segment that sets `Cache-Control`, `Pragma`, and `Expires` headers, then returns empty text.
- Keep the HTML clean and classed.
- Keep only two Awtsmoos segments: one for hidden `next`, one for server login logic.
- Rewrite `geelooy/style/forms.css` complete with stronger mobile-first UI.
- Verify static compile and live GET/POST.

Chapter 2: The Gate Became a Lantern

The first gate stopped bleeding stack traces into the street. Now the second gate must glow. The Awtsmoos, having no body and no form, is revealed specifically through disciplined edges: a header that cannot stale, a field that cannot overflow, a message that cannot become a jagged spear on a phone screen. Every pixel is a vessel; every vessel must be kind.