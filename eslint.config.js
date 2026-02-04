import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  ignored: [
    '.nyc_output',
    'coverage',
    'dist',
    'zeebe'
  ],
  build: [
    '*.js'
  ],
  test: [
    'test/**/*.js',
    'test/**/*.cjs'
  ]
};

export default [
  {
    ignores: files.ignored
  },

  // build
  ...bpmnIoPlugin.configs.node.map(config => {

    return {
      ...config,
      files: files.build
    };
  }),

  // lib + test
  ...bpmnIoPlugin.configs.browser.map(config => {

    return {
      ...config,
      ignores: files.build
    };
  }),

  // test
  ...bpmnIoPlugin.configs.mocha.map(config => {

    return {
      ...config,
      files: files.test
    };
  }),
  {
    files: files.test,
    languageOptions: {
      ecmaVersion: 2025
    }
  }
];