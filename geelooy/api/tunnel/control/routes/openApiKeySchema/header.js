//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyHeader
 * @description
 * The Awtsmoos lets schema identity and conversation paths stand before every deed in light;
 * Awtsmoos.com keeps the opening covenant small so later parameters remain readable and right.
 */

function header() {
	return `openapi: 3.1.0
info:
  title: Awtsmoos Tunnel Control - API Key Mode
  version: 1.0.0
  description: Use this schema for agents that should not use OAuth. The user provides apiKey and tunnelName.
servers:
  - url: https://awtsmoos.com
paths:
  /api/tunnel/control/bootstrap:
    get:
      operationId: awtsmoosBootstrap
      summary: Get setup instructions.
      security: []
      responses:
        "200":
          description: Bootstrap info.
          content:
            application/json:
              schema:
                type: object
                additionalProperties: true
                properties:
                  ok:
                    type: boolean
                required:
                  - ok

  /api/tunnel/control/conversations/register:
    get:
      operationId: awtsmoosConversationRegisterWithApiKey
      summary: Register a named work conversation for grouped tunnel history and previews.
      security: []
      parameters:
        - name: apiKey
          in: query
          required: true
          schema: { type: string }
        - name: conversationName
          in: query
          required: true
          schema: { type: string }
          description: Short stable task name. Send the returned conversationId on later actions.
        - name: conversationId
          in: query
          required: false
          schema: { type: string }
      responses:
        "200":
          description: Conversation registration response.
          content:
            application/json:
              schema:
                type: object
                additionalProperties: true

  /api/tunnel/control/conversations/list:
    get:
      operationId: awtsmoosConversationListWithApiKey
      summary: List grouped tunnel conversations, previews, and recent actions.
      security: []
      parameters:
        - name: apiKey
          in: query
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Conversation list response.
          content:
            application/json:
              schema:
                type: object
                additionalProperties: true

`;
}

module.exports = { header };
