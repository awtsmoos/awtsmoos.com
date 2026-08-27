B"H
# Nesher Studio Tab Capture Roadmap

## What works inside a normal page

Use `navigator.mediaDevices.getDisplayMedia({ video: true })`.
The user chooses a tab, window, or screen. The returned MediaStream can be drawn as a video source into the Nesher canvas and encoded like webcam.

This is now represented as a `display` source route in `modules/tabCaptureIdeas.js` and `makeDisplaySource()`.

## What cannot be done by a normal page

A web page cannot silently pick and record an arbitrary Chrome tab. Browser security requires user permission.
An iframe source also cannot be pixel-captured if cross-origin; Nesher records a safe iframe plate unless capture is done through display media or an extension.

## Best extension route

Build a Chrome extension with:
- `tabCapture` permission
- activeTab permission
- offscreen document permission if needed
- a content/control page that calls `chrome.tabCapture.capture`
- stream handoff to Nesher through a controlled extension page or WebRTC/MessageChannel bridge

## Best tunnel route

Do not bypass browser consent. Instead, add tunnel actions:
- chromeTabsList
- chromeTabFocus
- chromeExtensionInstallDev
- chromeCaptureWorkflowStart
- chromeCaptureWorkflowStatus
- chromeProfileLaunchWithExtension

These make the agent able to prepare and test the capture workflow while the extension/browser still owns real capture permission.
