//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyFsContentParams
 * @description
 * The Awtsmoos lets code, content, URL, and selectors cross in explicit documented vessels;
 * Awtsmoos.com keeps direct browser fields first-class while encoded carriers remain compatible essentials.
 */

function fsContentParams() {
	return `        - name: paths64
          in: query
          required: false
          schema:
            type: string
        - name: files64
          in: query
          required: false
          schema:
            type: string
        - name: content64
          in: query
          required: false
          schema:
            type: string
        - name: command64
          in: query
          required: false
          schema:
            type: string
        - name: script64
          in: query
          required: false
          schema:
            type: string
        - name: input64
          in: query
          required: false
          schema:
            type: string
        - name: shell
          in: query
          required: false
          schema:
            type: string
            enum:
              - powershell
              - cmd
              - bash
              - sh
        - name: cwd
          in: query
          required: false
          schema:
            type: string
            default: "."
        - name: url
          in: query
          required: false
          schema:
            type: string
          description: Direct URL for browser navigation and other URL-aware actions.
        - name: selector
          in: query
          required: false
          schema:
            type: string
          description: Direct CSS selector for browser actions such as chromeClick and chromeWaitForSelector.
        - name: text64
          in: query
          required: false
          schema:
            type: string
        - name: expression64
          in: query
          required: false
          schema:
            type: string
`;
}

module.exports = { fsContentParams };
