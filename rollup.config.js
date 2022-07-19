import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json';


function pgl(plugins=[]) {
  return [
    json(),
    nodeResolve(),
    commonjs(),
    ...plugins
  ];
}

const exports = pkg.exports;

const config = Object.keys(exports).map(key => {
  return {
    input: `src/${key}/index.js`,
    output: [
      { file: `dist/${key}/index.js`, format: 'cjs' },
      { file: `dist/${key}/index.esm.js`, format: 'es' }
    ],
    external: [
      'min-dash'
    ],
    plugins: pgl()
  };
});

export default config;