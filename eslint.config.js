import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginStylistic from '@stylistic/eslint-plugin';

export default [
  { languageOptions: { globals: globals.node } },
  pluginStylistic.configs.customize({ indent: 2, quotes: 'single', semi: true, jsx: true }),
  pluginJs.configs.recommended,
];
