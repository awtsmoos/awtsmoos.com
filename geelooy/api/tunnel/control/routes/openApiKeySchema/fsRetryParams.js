//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyFsRetryParams
 * @description
 * The Awtsmoos keeps original deed identity distinct from polling and continuation detail;
 * Awtsmoos.com exposes retry testimony explicitly so reconciliation stays faithful and real.
 */

function fsRetryParams() {
	return `        - name: controlRequestId
          in: query
          required: false
          schema:
            type: string
          description: Exact durable request id returned by tunnelRequestPending.
        - name: originalControlRequestId
          in: query
          required: false
          schema:
            type: string
        - name: requestedAction
          in: query
          required: false
          schema:
            type: string
        - name: requestAction
          in: query
          required: false
          schema:
            type: string
        - name: resumeToken
          in: query
          required: false
          schema:
            type: string
        - name: jobId
          in: query
          required: false
          schema:
            type: string
        - name: taskId
          in: query
          required: false
          schema:
            type: string
        - name: actionId
          in: query
          required: false
          schema:
            type: string
        - name: stream
          in: query
          required: false
          schema:
            type: string
            enum:
              - stdout
              - stderr
        - name: waitTimeoutMs
          in: query
          required: false
          schema:
            type: integer
            default: 25000
        - name: pollIntervalMs
          in: query
          required: false
          schema:
            type: integer
            default: 100
        - name: offsetChars
          in: query
          required: false
          schema:
            type: integer
            default: 0
        - name: inlineOutput
          in: query
          required: false
          schema:
            type: boolean
            default: true
        - name: params
          in: query
          required: false
          schema:
            type: string
          description: JSON compatibility carrier for retry, continuation, and legacy action parameters.
`;
}

module.exports = { fsRetryParams };
