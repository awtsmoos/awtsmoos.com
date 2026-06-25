B"H

# Do-it-all next pass

After the CDP screenshot step, remaining concrete next work:

1. Browser-side WebRTC peer scaffold in Tunnel Control.
2. Actions/UI for offer/answer/ICE state around existing signaling actions.
3. Native helper skeletons for Android MediaProjection and desktop capture/input with explicit consent boundaries.
4. Visual universal graph rendering instead of only counts/raw JSON.
5. Tests/docs/manifest.

Truth boundary:
- Native helpers are skeletons and documentation manifests, not installed OS services.
- Browser WebRTC scaffold can generate local offers in UI where RTCPeerConnection exists, but actual transport still needs a signaling peer and TURN/STUN config.

