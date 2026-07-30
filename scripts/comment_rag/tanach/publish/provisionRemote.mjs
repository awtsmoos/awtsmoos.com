// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file provisionRemote.mjs
 * @description The Awtsmoos prepares one isolated Linux query vessel whose model
 * and dependency covenant match the local Tanach vectors served by Awtsmoos.com.
 */
import { execAwtsmoosSsh } from '../../../lib/awtsmoosSshClient.mjs';
import { loadPassword } from '../../../lib/safeSshPasswordStore.mjs';
import { REMOTE_RAG_ROOT, quote } from './remotePaths.mjs';

const password = loadPassword();
if (!password) throw new Error('stored_ssh_password_missing');
const root = REMOTE_RAG_ROOT;
const uvRoot = `${root}/uv-home`;
const uv = `${uvRoot}/bin/uv`;
const environment = `${root}/tanach-embedding-venv-312`;
const model = `${root}/models/multilingual-e5-small`;
const packages = [
	'torch==2.2.2',
	'sentence-transformers==3.4.1',
	'numpy==1.26.4',
	'scipy==1.13.1',
	'scikit-learn==1.5.2',
	'transformers==4.48.3',
	'tokenizers==0.21.0'
].map(quote).join(' ');
const command = [
	'set -Eeuo pipefail',
	`mkdir -p ${quote(`${uvRoot}/bin`)}`,
	`test -x ${quote(uv)} || curl -LsSf https://astral.sh/uv/install.sh | UV_INSTALL_DIR=${quote(`${uvRoot}/bin`)} sh`,
	`UV_PYTHON_INSTALL_DIR=${quote(`${uvRoot}/python`)} ${quote(uv)} venv --python 3.12 ${quote(environment)}`,
	`${quote(uv)} pip install --python ${quote(`${environment}/bin/python`)} ${packages}`,
	`${quote(`${environment}/bin/python`)} - <<'PY'`,
	'from sentence_transformers import SentenceTransformer',
	`model = SentenceTransformer(${JSON.stringify(model)}, local_files_only=True)`,
	"vectors = model.encode(['query: בריאת העולם'], normalize_embeddings=True)",
	"assert vectors.shape == (1, 384), vectors.shape",
	"print('B\\\"H remote multilingual runtime ready', vectors.shape)",
	'PY'
].join('\n');
const result = await execAwtsmoosSsh({ password }, command);
if (!result.ok) throw new Error(result.stderr || `remote_exit_${result.code}`);
console.log(result.stdout);
