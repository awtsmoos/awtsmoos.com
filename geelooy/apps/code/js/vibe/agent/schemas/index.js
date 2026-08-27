// B"H
import { FileSystemSchemas } from './FileSystem.js';
import { TestingSchemas } from './Testing.js';
import { OrchestrationSchemas } from './Orchestration.js';
import { RuntimeSchemas } from './Runtime.js';
import { WorkflowSchemas } from './Workflow.js';
import { CognitionSchemas } from './Cognition.js';

export const ToolSchemas = [
    ...FileSystemSchemas,
    ...TestingSchemas,
    ...OrchestrationSchemas,
    ...RuntimeSchemas,
    ...WorkflowSchemas,
    ...CognitionSchemas
];
