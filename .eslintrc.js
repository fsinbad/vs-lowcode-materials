module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', '@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'prettier/prettier': 'error',
    'func-names': 'off',
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'max-classes-per-file': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'class-methods-use-this': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'import/no-unresolved': 'off',
    'no-useless-constructor': 'off',
    'no-empty-function': 'off',
    'import/extensions': 'off',
    'consistent-return': 'off',
    'no-use-before-define': 'off',
    'array-callback-return': 'off',
    'no-param-reassign': 'off',
    'no-new-func': 'off',
    'no-empty': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
};
