B"H

# Remote desktop over apps/tunnel: first brainstorm

Goal: let an authorized remote operator see and optionally control a local desktop/app surface through `geelooy/apps/tunnel`, without ever becoming spyware.

Core shape:
- Local agent owns capture and consent.
- Browser dashboard requests a session.
- Local machine shows an unmistakable consent prompt.
- A session token is minted only after consent.
- Video flows out; input flows in only if control is granted.
- A persistent red/green indicator remains visible while sharing.
- One click revokes everything.

Transport options:
1. WebRTC stream: best latency, NAT-friendly, supports data channel for input.
2. MJPEG / WebSocket frames: simplest prototype, heavier bandwidth.
3. HLS / fragmented MP4: useful for watch-only, poor for interactive control.
4. Browser tab capture: safest first scope, because browser permission UX already exists.
5. Native screen capture helper: strongest capability, highest consent/security requirement.

Tunnel actions to design later:
- `remoteDesktopCreateSession`
- `remoteDesktopConsentStatus`
- `remoteDesktopStartCapture`
- `remoteDesktopStopCapture`
- `remoteDesktopOffer`
- `remoteDesktopAnswer`
- `remoteDesktopIceCandidate`
- `remoteDesktopInputEvent`
- `remoteDesktopAuditLog`

Security gates:
- Default watch-only.
- Control requires a separate explicit grant.
- Input events are allowlisted: pointer move, click, wheel, keypress; no raw shell.
- Clipboard disabled by default.
- File drag/drop disabled by default.
- Audit every connection, grant, input burst, and stop event.
- Auto-timeout idle sessions.
- Session tokens short-lived and bound to device/tunnel/user.

MVP path:
1. Tab-only remote view using browser `getDisplayMedia` or controlled Chrome target screenshots.
2. WebRTC data channel for heartbeat only.
3. Add pointer overlay preview without injecting input.
4. Add explicit control grant and safe pointer/click relay.
5. Add keyboard relay with visible local warning and escape key panic stop.

Open questions:
- Should the first prototype control only Chrome pages the tunnel already launched?
- Should native desktop capture live in the existing Node agent or a separate helper?
- Should hosted relay be allowed, or only peer-to-peer WebRTC?
- What is the consent UI standard across Mac/Windows/Linux?

