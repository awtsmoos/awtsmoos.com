// B"H
import { writeTarThroughSftp } from './dayuhSftpPipelineWriter.mjs';

/**
 * Reveals one immutable directory as a verified tar stream through the custom
 * SFTP client's bounded fixed-offset writer.
 */
export function streamTarArchive(options) {
	return writeTarThroughSftp(options);
}
