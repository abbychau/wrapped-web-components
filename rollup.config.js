import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'WebComponentWrapper',
      sourcemap: !production
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: !production
    }
  ],
  plugins: [
    resolve(),

    // Only minify in production
    production && terser(),

    // Live reload during development
    !production && livereload({
      watch: ['dist', 'examples'],
      verbose: false
    })
  ]
};
