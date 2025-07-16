import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  external: ['react', 'react-dom'],
  output: [
    { file: 'dist/esm/index.js', format: 'esm', sourcemap: true },
    { file: 'dist/cjs/index.js', format: 'cjs', sourcemap: true }
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({ 
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: false

     })
  ]
};
