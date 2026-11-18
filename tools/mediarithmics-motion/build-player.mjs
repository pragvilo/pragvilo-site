import {build} from 'esbuild';
import {resolve} from 'node:path';
await build({
  entryPoints: ['src/Player.tsx'], bundle: true, minify: true,
  format: 'iife', target: 'es2020', define: {'process.env.NODE_ENV': '"production"'},
  outfile: resolve(process.argv[2] || '../../mediarithmics-structure/assets/journey-player.js'),
  legalComments: 'linked',
});
