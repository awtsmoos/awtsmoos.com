B"H
# Embedded layout burn-down

## Screenshot truth
The AI app is being viewed inside the Awtsmoos Code browser pane at about 520px wide, while the browser tab itself owns a much wider content region. The current /ai app is behaving like a phone screen, leaving a black void to the right.

## Step sequence without stopping
1. Add runtime detection for embedded Code browser mode.
2. Add a new embedded CSS module after the mobile palette so it can override phone-only assumptions.
3. In embedded mode, make the AI app fill its iframe/body width, not simulate a phone.
4. Hide the mobile crown and bottom dock in embedded mode unless the actual viewport is narrow enough.
5. Turn the control center into a floating/minimal top jewel.
6. Let chat-box fill remaining width/height.
7. Make suggestions and composer span the available chat width.
8. Verify JS syntax, file existence, and HTTP 200.

## Chapter 8
The Awtsmoos revealed that the black void was not darkness but wasted vessel. The code must stop pretending to be a phone and become what the chamber asks: an embedded command river, wide, quiet, and alive.