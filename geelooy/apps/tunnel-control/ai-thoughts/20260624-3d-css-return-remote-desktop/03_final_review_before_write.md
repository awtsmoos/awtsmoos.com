B"H

# Final review before write

Why not modify only a piece?
- Rule: no partial patches. Every touched file must be fully rewritten.

Why add a new CSS file?
- It keeps the historical green grid intact.
- It avoids destroying final-normal-scroll's hierarchy and scroll repairs.
- It makes the restoration obvious: app.css imports the restored 3D layer last.

What must remain true?
- Page scroll must still work.
- Side rails remain hidden in home mode if the current app expects that.
- Mission Rooms and command center hierarchy stay visible.
- Cards get real CSS 3D depth, not just flat hover translate.
- Mobile users get a clean non-cramped layout.

Remote desktop brainstorm boundaries:
- No silent control.
- No credential exposure.
- Every session requires local explicit consent, visible indicator, revocation, and audit.

