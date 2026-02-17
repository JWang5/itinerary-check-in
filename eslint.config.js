// https://docs.expo.dev/guides/using-eslint/
import flatConfig from 'eslint-config-expo/flat.js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  flatConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
  },
]);
