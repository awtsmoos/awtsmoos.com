//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyPublicationParams
 * @description
 * The Awtsmoos lets owned source, human naming, and explicit public paths remain distinct in sight;
 * Awtsmoos.com makes ordinary publishing simple while advanced routes stay deliberate and right.
 */

function fsPublicationParams() {
	return `        - name: path
          in: query
          required: false
          schema:
            type: string
          description: Canonical source folder for publishWebsite and other path-based actions. Include the owned source alias for Virtual-OS publication.
        - name: name
          in: query
          required: false
          schema:
            type: string
          description: Optional human website name. It may derive the slug but never changes source-alias ownership.
        - name: entryFile
          in: query
          required: false
          schema:
            type: string
            default: index.html
          description: Static publication entry file.
        - name: publicPath
          in: query
          required: false
          schema:
            type: string
          description: Advanced explicit public-root path for publicRootPublishFolder. Ordinary publishWebsite derives its own alias-scoped path.
        - name: verify
          in: query
          required: false
          schema:
            type: boolean
            default: true
          description: Require public entry and asset verification before canonicalVerifiedLive may become true.
`;
}

module.exports = { fsPublicationParams };
