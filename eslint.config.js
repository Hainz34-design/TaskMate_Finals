// Link ng Expo sa gabay para sa ESLint configuration ng project.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Pagsamahin ang Expo rules at huwag i-lint ang generated dist files.
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
