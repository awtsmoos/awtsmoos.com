//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyFsIdentityParams
 * @description
 * The Awtsmoos separates route kind from exact browser page identity in every request;
 * Awtsmoos.com documents both plainly so vessel selection and Chrome targeting stay at their best.
 */

function fsIdentityParams() {
	return `        - name: p
          in: query
          required: false
          schema:
            type: string
            default: "."
        - name: targetVessel
          in: query
          required: false
          schema:
            type: string
            enum:
              - native-local
              - native
              - browser-tab
              - virtual-os
          description: Route-kind hint only. Use native-local for local files, browser-tab for browser storage, or virtual-os for the hosted Virtual OS.
        - name: chromeTargetId
          in: query
          required: false
          schema:
            type: string
            pattern: "^[A-Fa-f0-9]{32}$"
          description: Exact Chrome DevTools page target ID for chrome* browser actions. Prefer this over overloading targetVessel.
        - name: conversationId
          in: query
          required: false
          schema:
            type: string
          description: Stable id returned by conversation registration.
        - name: conversationName
          in: query
          required: false
          schema:
            type: string
          description: Short stable task name for grouped action history and previews.
        - name: depth
          in: query
          required: false
          schema:
            type: integer
            default: 2
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            default: 150
        - name: maxChars
          in: query
          required: false
          schema:
            type: integer
            default: 12000
`;
}

module.exports = { fsIdentityParams };
