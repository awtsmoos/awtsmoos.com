// B"H
/**
 * @file TestingExecutor.js
 * @brief Executes headless simulator tools and verifies editor/tunnel/runtime parity from inside the coding tab.
 */

import { BackgroundTester } from '../testing/BackgroundTester.js';
import { NodeManager } from '../../../node/manager.js';
import { FileSystemExecutor } from './FileSystemExecutor.js';
import { FileSystemProvider } from '../../../fs-provider.js';

const SEMANTIC_TOOLS = [
  'semantic_outline',
  'semantic_search',
  'dependency_graph',
  'file_hashes',
  'replace_range',
  'apply_patch'
];

const RUNTIME_TOOLS = [
  'inspect_runtime',
  'launch_preview',
  'list_previews',
  'preview_logs',
  'stop_preview',
  'restart_preview'
];

const TUNNEL_PREVIEW_TOOLS = [
  'inspectRuntime',
  'launchPreview',
  'listPreviews',
  'previewLogs',
  'stopPreview',
  'restartPreview'
];

const PARITY_SURFACES = [
  { surface: 'editor-modular-fs', file: 'vibe/agent/schemas/FileSystem.js', tools: SEMANTIC_TOOLS },
  { surface: 'editor-legacy-schemas', file: 'vibe/agent/ToolSchemas.js', tools: [...SEMANTIC_TOOLS, ...RUNTIME_TOOLS] },
  { surface: 'editor-runtime-schemas', file: 'vibe/agent/schemas/Runtime.js', tools: RUNTIME_TOOLS },
  { surface: 'editor-router', file: 'vibe/agent/executors/ToolRouter.js', tools: [...SEMANTIC_TOOLS, ...RUNTIME_TOOLS] },
  { surface: 'editor-fs-executor', file: 'vibe/agent/executors/FileSystemExecutor.js', tools: SEMANTIC_TOOLS },
  { surface: 'editor-runtime-executor', file: 'vibe/agent/executors/RuntimeExecutor.js', tools: RUNTIME_TOOLS },
  { surface: 'editor-runtime-manifest', file: 'vibe/runtime/RuntimeManifest.js', tools: ['RuntimeManifest', 'awtsmoos.vibe.runtime'] },
  { surface: 'editor-preview-manager', file: 'vibe/runtime/PreviewRuntimeManager.js', tools: ['RuntimeManifest', 'manifest'] },

  { surface: 'tunnel-docs-actions', file: '../../../api/tunnel/control/docs/actions.js', tools: TUNNEL_PREVIEW_TOOLS },
  { surface: 'tunnel-preview-actions', file: '../../tunnel/agent/tools/fs/actionGroups/previewActions.js', tools: [...TUNNEL_PREVIEW_TOOLS, 'publicUrl', 'previewProxyUrl'] },
  { surface: 'tunnel-agent-registry', file: '../../tunnel/agent/tools/fs/actions.js', tools: ['buildPreviewActions'] },
  { surface: 'tunnel-runtime-manifest', file: '../../tunnel/agent/tools/fs/runtimeManifest.js', tools: ['createRuntimeManifest', 'awtsmoos.vibe.runtime'] },
  { surface: 'tunnel-preview-proxy-route', file: '../../../api/tunnel/control/routes/previewProxy.js', tools: ['previewProxy', 'httpRequest'] },
  { surface: 'tunnel-route-table', file: '../../../api/tunnel/control/routes/table.js', tools: ['preview/:tunnelName', 'previewProxy'] },
  { surface: 'dynamic-openapi', file: '../../../api/tunnel/control/routes/openApi.js', tools: ['/api/tunnel/control/preview/{tunnelName}', 'awtsmoosPreviewProxy'] },
  { surface: 'api-key-openapi', file: '../../../api/tunnel/control/routes/openApiKey.js', tools: [...TUNNEL_PREVIEW_TOOLS, '/api/tunnel/control/preview/{tunnelName}', 'awtsmoosPreviewProxyWithApiKey'] },
  { surface: 'gpt-action-yaml', file: '../../tunnel-control/gpt/awtsmoos-action-openapi.yaml', tools: [...TUNNEL_PREVIEW_TOOLS, '/api/tunnel/control/preview/{tunnelName}', 'awtsmoosPreviewProxy'] }
];

/**
 * B"H
 * Reads a provider item as text, whether the vessel returns a Blob or string.
 *
 * @param {object} item Provider read item.
 * @returns {Promise<string>} Text content.
 */
async function readTextItem(item) {
  const raw = await FileSystemProvider.read(item);
  return raw instanceof Blob ? await raw.text() : String(raw);
}

/**
 * B"H
 * Verifies that all AI-visible capabilities are present across the editor,
 * tunnel agent, OpenAPI, and GPT Action schema surfaces.
 *
 * @param {object} ws Workspace provider descriptor.
 * @param {string} coreType Provider type.
 * @param {Function} resolvePath Path jail resolver.
 * @returns {Promise<object>} Structured parity result.
 */
async function verifyParity(ws, coreType, resolvePath) {
  const missing = [];

  for (const surface of PARITY_SURFACES) {
    let text = '';
    try {
      const abs = resolvePath(surface.file);
      text = await readTextItem({ ...ws, path: abs, kind: 'file', type: coreType });
    } catch (e) {
      missing.push({ surface: surface.surface, file: surface.file, tool: '<file>', error: e.message });
      continue;
    }

    for (const tool of surface.tools) {
      if (!text.includes(tool)) {
        missing.push({ surface: surface.surface, file: surface.file, tool });
      }
    }
  }

  return {
    ok: missing.length === 0,
    semanticTools: SEMANTIC_TOOLS.length,
    runtimeTools: RUNTIME_TOOLS.length,
    tunnelPreviewTools: TUNNEL_PREVIEW_TOOLS.length,
    surfaces: PARITY_SURFACES.length,
    missing
  };
}

export const TestingExecutor = {
  async execute(name, args, ws, coreType, resolvePath, tabId) {
    if (name === 'run_ui_test') {
      const absPath = args.html_entry_path ? resolvePath(args.html_entry_path) : null;
      const targetUrl = args.target_url || null;

      if (!absPath && !targetUrl) {
        return '[B"H Error] You must provide either html_entry_path or target_url to run the test.';
      }

      return await BackgroundTester.runSimulation(
        ws,
        coreType,
        absPath,
        targetUrl,
        args.test_plan,
        tabId
      );
    }

    if (name === 'run_node_script') {
      const absPath = resolvePath(args.entry_path);
      return await NodeManager.executeForReport({
        ...ws,
        path: absPath,
        kind: 'file',
        type: coreType
      }, tabId, args.timeout_ms || 10000);
    }

    if (name === 'verify_vibe_tool_parity') {
      return JSON.stringify(await verifyParity(ws, coreType, resolvePath), null, 2);
    }

    if (name === 'run_command_batch') {
      const commandList = Array.isArray(args.commands) ? args.commands : [];
      if (commandList.length === 0) {
        return '[B"H Error] commands must be a non-empty array.';
      }

      const results = [];
      for (let i = 0; i < commandList.length; i += 1) {
        const command = String(commandList[i] || '').trim();
        if (!command) continue;

        const output = await FileSystemExecutor.execute(
          'run_terminal_command',
          { command, cwd: i === 0 ? args.cwd : undefined },
          ws,
          coreType,
          resolvePath,
          null,
          null
        );

        results.push({ command, output });
      }

      return JSON.stringify({ results }, null, 2);
    }

    throw new Error(`Unhandled Testing Schema: ${name}`);
  }
};
