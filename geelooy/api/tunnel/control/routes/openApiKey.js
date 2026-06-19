
// B"H

async function openApiKey($i) {
  $i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

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

  /api/tunnel/control/fs/{tunnelName}:
    get:
      operationId: awtsmoosTunnelActionWithApiKey
      summary: Run an Awtsmoos tunnel action using a user-provided API key.
      security: []
      parameters:
        - name: tunnelName
          in: path
          required: true
          schema:
            type: string
          description: User's tunnel name from the control panel.
        - name: apiKey
          in: query
          required: true
          schema:
            type: string
          description: User's Awtsmoos API key beginning with ak_.
        - name: action
          in: query
          required: true
          schema:
            type: string
            enum:
              - list
              - tree
              - read
              - md
              - bulk
              - write
              - bulkWrite
              - commandRun
              - nodeScriptRun
              - chromeFind
              - chromeLaunch
              - chromeStatus
              - chromeNavigate
              - chromeWaitForSelector
              - chromeClick
              - chromeType
              - chromeEval
              - chromeRunScript
              - restartPreview, semanticDiff, detectConceptClusters, simulateFailure, generateRepairPlan, superviseRuntime, inferArchitecture, detectAbstractionLeaks, runtimeEntityGraph, semanticRefactor, inspectRenderStorms, runtimeContractRegistry, semanticSearchRuntime, previewBranchMatrix, inferBusinessRules, stateTimeMachine, detectDeadConcepts, semanticMerge, runtimeIntrospectionStream, architectureScore, intentDriftDetector, semanticPackageGenerator, selfHealPreview, generateTestUniverse, inspectHumanConfusion, orchestrationGraph, environmentVirtualizer, runtimeSnapshot, semanticCache, goalCompiler, autonomousBackgroundAgents, semanticPipeline, universalAppManifest
              - stopPreview
              - previewLogs
              - listPreviews
              - launchPreview
              - inspectRuntime
        - name: p
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
          description: Use native-local for local files, browser-tab for browser storage, virtual-os for the hosted virtual OS.
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
        - name: paths64
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
        - name: selector
          in: query
          required: false
          schema:
            type: string
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
      responses:
        "200":
          description: Tunnel response.
          content:
            application/json:
              schema:
                type: object
                additionalProperties: true
                properties:
                  ok:
                    type: boolean
                  action:
                    type: string
                  content:
                    type: string
                  items:
                    type: array
                    items:
                      type: string
                  error:
                    type: string
                required:
                  - ok

  /api/tunnel/control/preview/{tunnelName}:
    get:
      operationId: awtsmoosPreviewProxyWithApiKey
      summary: Fetch a live preview through an API-key authenticated tunnel.
      security: []
      parameters:
        - name: tunnelName
          in: path
          required: true
          schema: { type: string }
        - name: apiKey
          in: query
          required: true
          schema: { type: string }
        - name: url
          in: query
          required: false
          schema: { type: string }
        - name: url64
          in: query
          required: false
          schema: { type: string }
      responses:
        "200":
          description: Live preview response body.
          content:
            text/html:
              schema: { type: string }
            application/json:
              schema:
                type: object
                additionalProperties: true

`;
}

module.exports = { openApiKey };
