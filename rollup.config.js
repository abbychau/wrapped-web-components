import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;

export default [
  // Main build - non-minified version
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'umd',
        name: 'WebComponentWrapper',
        sourcemap: true
      },
      {
        file: 'dist/index.esm.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      // Live reload during development
      !production && livereload({
        watch: ['dist', 'examples'],
        verbose: false
      })
    ]
  },
  
  // Main build - minified version
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.min.js',
        format: 'umd',
        name: 'WebComponentWrapper',
        sourcemap: true
      },
      {
        file: 'dist/index.esm.min.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      terser()
    ]
  },
  
  // Docs build - non-minified version
  {
    input: 'src/index.js',
    output: [
      {
        file: 'docs/dist/index.js',
        format: 'umd',
        name: 'WebComponentWrapper',
        sourcemap: true
      },
      {
        file: 'docs/dist/index.esm.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      !production && livereload({
        watch: ['docs'],
        verbose: false
      })
    ]
  },
  
  // Docs build - minified version
  {
    input: 'src/index.js',
    output: [
      {
        file: 'docs/dist/index.min.js',
        format: 'umd',
        name: 'WebComponentWrapper',
        sourcemap: true
      },
      {
        file: 'docs/dist/index.esm.min.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      terser()
    ]
  }
];
