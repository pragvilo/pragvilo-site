import {build} from 'esbuild';
import {resolve,join} from 'node:path';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
await build({
  entryPoints: ['src/Player.tsx'], bundle: true, minify: true,
  format: 'iife', target: 'es2020', define: {'process.env.NODE_ENV': '"production"'},
  outfile: resolve(process.argv[2] || '../../mediarithmics-structure/assets/journey-player.js'),
  legalComments: 'linked',
});

// Generate the no-animation fallback from the very same portrait layout.
const temporary = await mkdtemp(join(tmpdir(),'mics-audience-'));
try {
  await build({
    stdin:{contents:`import {renderToStaticMarkup} from 'react-dom/server';
      import {AudienceIllustration} from './src/AudiencePortraits';
      import {writeFileSync} from 'node:fs';
      const sectors=['media','retail','brands'];
      sectors.forEach((sector,index)=>{
        const markup=renderToStaticMarkup(<AudienceIllustration frame={index*180+45}/>);
        const svg=markup.slice(markup.indexOf('<svg'),markup.lastIndexOf('</svg>')+6).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
        writeFileSync(process.argv[2]+'/audience-'+sector+'.svg',svg);
      });`,resolveDir:process.cwd(),loader:'tsx'},
    bundle:true,platform:'node',format:'cjs',jsx:'automatic',
    define:{'process.env.NODE_ENV':'"production"'},
    outfile:join(temporary,'fallback.cjs'),
  });
  execFileSync(process.execPath,[join(temporary,'fallback.cjs'),resolve('../../mediarithmics-structure/assets')]);
} finally {await rm(temporary,{recursive:true,force:true});}
