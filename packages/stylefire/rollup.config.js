import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

const typescriptConfig = { cacheRoot: 'tmp/.rpt2_cache' };
const noDeclarationConfig = Object.assign({}, typescriptConfig, {
  tsconfigOverride: { compilerOptions: { declaration: false } }
});

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return id => pattern.test(id);
};

const deps = Object.keys(pkg.dependencies || {});
const peerDeps = Object.keys(pkg.peerDependencies || {});

const config = {
  input: 'src/index.ts',
  external: makeExternalPredicate(deps.concat(peerDeps))
};

const umd = Object.assign({}, config, {
  output: {
    file: 'dist/stylefire.js',
    format: 'umd',
    name: 'stylefire',
    exports: 'named',
    globals: {
      'style-value-types': 'valueTypes'
    }
  },
  external: makeExternalPredicate(peerDeps),
  plugins: [typescript(noDeclarationConfig), resolve()]
});

const umdProd = Object.assign({}, umd, {
  output: Object.assign({}, umd.output, {
    file: 'dist/stylefire.min.js'
  }),
  plugins: [typescript(noDeclarationConfig), resolve(), uglify()]
});

const es = Object.assign({}, config, {
  output: {
    file: pkg.module,
    format: 'es',
    exports: 'named'
  },
  plugins: [typescript(noDeclarationConfig)]
});

const cjs = Object.assign({}, config, {
  output: {
    file: pkg.main,
    format: 'cjs',
    exports: 'named'
  },
  plugins: [typescript(typescriptConfig)]
});

export default [umd, umdProd, es, cjs];
