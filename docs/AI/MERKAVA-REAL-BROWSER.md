B"H

# Merkava real Chromium — owner-operated browser

The Awtsmoos clothes a live browser in a private Linux profile. A pixel is a witness only after the real Chromium process produces it.

## Deployment layout

- Google Chrome Stable is a separate OS package, never part of the lightweight tunnel installer.
- Linux service user `awtsmoos-merkava` owns `/var/lib/awtsmoos-merkava` and its `profiles/primary` directory. Do not copy the profile or any cookies into Git or logs.
- `awtsmoos-merkava-xvfb.service` owns a virtual X11 display `:99` with private Xauthority. No TCP X11 listener.
- `awtsmoos-merkava-browser.service` owns a real graphical Chrome process on that display, with Chrome sandboxing enabled. CDP is bound only to `127.0.0.1:9222`.
- `awtsmoos-merkava-vnc.service` exposes a password-protected VNC view only on `127.0.0.1:5900`; no unauthenticated RFB mode.
- `awtsmoos-merkava-novnc.service` exposes its viewer only on `127.0.0.1:6080`. VNC authentication is mandatory.
- None of these services is enabled automatically by this source release; owners may explicitly activate them as capacity permits.

## User-controlled Google sign-in

1. Authenticate to the Linux host with the owner's existing SSH credentials.
2. Open an encrypted forwarding session from the owner's device:

   `ssh -L 6080:127.0.0.1:6080 <ssh-user>@awtsmoos.com`

3. In a local browser visit `http://127.0.0.1:6080/vnc.html`.
4. The authorized Linux owner may read the **private** VNC password via SSH (`sudo cat /var/lib/awtsmoos-merkava/.vnc/owner-password`). Never paste it, a Google password, or a 2FA code into chat.
5. Enter credentials and security challenges **only** in the real Google webpage shown in Chrome.
6. Open `https://mail.google.com/` from that browser, confirm the authenticated Gmail UI, and verify reload/reconnect **after** successful user sign-in. Do not claim success from the sign-in screen alone.

Do not expose noVNC, VNC, or Chrome DevTools through a bare public reverse proxy. NoVNC's loopback HTTP service relies on SSH encryption and VNC authentication, not TLS itself.

## Capture and transfer evidence

- `chromeScreenshot` binds the requested Chrome target and calls Chrome DevTools `Page.captureScreenshot` without a second preliminary target health probe.
- PNG or JPEG is SHA-256 verified, dimensions recorded, and image bytes kept in a private content-addressed file. The action returns a compact binary transfer descriptor, not a `frame64` JSON payload.
- Browser DevTools itself carries base64 internally. The subsequent file transport uses raw streamed/chunked bytes. A loopback HTTP receiver test proves matching SHA and length; this does **not** by itself prove delivery to a particular ChatGPT client.
- Live browser regression: `AWTSMOOS_MERKAVA_LIVE_TEST=1 node geelooy/apps/tunnel/agent/testing/merkavaRealBrowser.smoke.cjs`. Only run on the authorized Linux machine with the dedicated browser active. The test creates and closes its own tabs, leaving a Google sign-in tab for owner interaction.

## Measured limitations and safety

- Headed Xvfb Chrome renders Mitzvah World selection UI, but WebGL context creation failed on the tested Linux host; a gameplay/FPS benchmark is not passed.
- A single dedicated Chrome process and OS account are currently used. Do not interpret this as proven multi-user profile isolation. Provision separate service identities and CDP permissions before sharing Merkava with other users.
- Real Google account authorization, authenticated Gmail screenshot, browser-to-public-client image attachment, and survival across credentialed session restart remain dependent on further owner-authorized testing.
- Installed Chrome has appreciable RAM overhead on a 2 GiB host; keep browser startup separate from tunnel startup.
