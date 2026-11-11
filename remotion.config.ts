import { Config } from '@remotion/cli/config';
import fs from 'node:fs';
import os from 'node:os';

// Keep Remotion bundles and render temp files off the small C: drive.
// A TEMP already pointing elsewhere (e.g. set for a batch render) is respected.
const tempDir = 'F:\\remotion-tmp';
if (os.tmpdir().toUpperCase().startsWith('C:')) {
	fs.mkdirSync(tempDir, { recursive: true });
	process.env.TEMP = tempDir;
	process.env.TMP = tempDir;
}

Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
