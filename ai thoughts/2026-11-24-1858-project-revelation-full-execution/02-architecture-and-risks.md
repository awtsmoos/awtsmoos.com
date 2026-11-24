# B"H — 02 Architecture and risks

Hierarchy confirmed in code and live data: account -> alias -> heichel -> nested series -> post. Canonical route module geelooy/shared/social/model/CanonicalPostRoute.mjs (21 lines) is the single route authority; composer workflow + quick review consume it.
Visualizer chain (verified end-to-end in source): composer PostPayloadParts allowlist [waveform,spectrum,celestial] -> server AttachmentSchema AUDIO_VISUALIZERS (same list, audio-only) -> RichPostSchema normalizeRichPost (rootAssets + section assets) -> reader PostManifestElements passes asset.visualizer to attachAudioEffects initial mode; listener can override/disable; native playback preserved on failure.
Module-system risk (root cause of 2 failing contracts): browser ESM directories need a package.json {"type":"module"} for Node contract tests — geelooy/shared and geelooy/social-composer have one; geelooy/profile did not. Fixed this session.
CSS risk: HeichelNavigation.js used inline style.cssText (bypassed design system AND crashed the shared SocialUxTestDom). Moved to scoped stylesheet profile-heichel-nav-v4.css.
File-permission law learned: files uploaded via scp land 640; the site 403s them. Production files must be 644 (same lesson the piano session hit). All files from this session chmod 644 and live-verified.
Performance risk: 2 CPUs, load 10-12 from concurrent sessions; public TTFB for /heichelos/ spiked 46.6s once, 12.7s once, 0.5-1.0s other times; local 8080 consistently 0.6-0.7s. Saturation, not a route defect (see 06).
Security posture verified read-only: /api/social/unified-social/destinations/<id>/root without login returns NO_LOGIN error JSON; catalog scope is awtsmoos.api; no consent bypass attempted.
