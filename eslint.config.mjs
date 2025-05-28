import { configs as ngConfigs } from 'angular-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { configs as tsConfigs } from 'typescript-eslint';

export default [
  {
    plugins: {
      jsdoc,
      'simple-import-sort': simpleImportSort,
    },
  },
  ...tsConfigs.recommended,
  ...tsConfigs.recommendedTypeChecked,
  ...ngConfigs.tsRecommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    name: '@hcl/default-config',
    rules: {
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
        },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        'fixStyle': 'inline-type-imports',
      }],
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/explicit-member-accessibility': [
        'off',
        {
          accessibility: 'explicit',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            memberTypes: [
              'static-field',
              'static-get',
              'static-set',
              'protected-static-field',
              'protected-static-get',
              'protected-static-set',
              'private-static-field',
              'private-static-get',
              'private-static-set',
              'static-method',
              'private-static-method',
              'protected-static-method',
              'public-field',
              'public-get',
              'public-set',
              'protected-field',
              'protected-get',
              'protected-set',
              'private-field',
              'private-get',
              'private-set',
              'constructor',
              'public-method',
              'protected-method',
              'private-method',
            ],
            order: 'alphabetically-case-insensitive',
          },
          interfaces: {
            order: 'alphabetically-case-insensitive',
          },
          typeLiterals: {
            order: 'alphabetically-case-insensitive',
          },
        },
      ],
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            Boolean: {
              message: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
            },
            Function: {
              message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.',
            },
            Number: {
              message: 'Avoid using the `Number` type. Did you mean `number`?',
            },
            Object: {
              message: 'Avoid using the `Object` type. Did you mean `object`?',
            },
            String: {
              message: 'Avoid using the `String` type. Did you mean `string`?',
            },
            Symbol: {
              message: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
            },
          },
        },
      ],
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/triple-slash-reference': [
        'error',
        {
          lib: 'always',
          path: 'always',
          types: 'prefer-import',
        },
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/unified-signatures': 'error',
      'arrow-parens': [
        'off',
        'always',
      ],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
          imports: 'always-multiline',
          objects: 'always-multiline',
        },
      ],
      complexity: 'off',
      'constructor-super': 'error',
      eqeqeq: [
        'error',
        'smart',
      ],
      'guard-for-in': 'off',
      'id-blacklist': 'off',
      'id-match': 'off',
      'import/order': 'off',
      'jsdoc/check-alignment': 'error',
      'max-classes-per-file': [
        'off',
        1,
      ],
      'max-len': [
        'error',
        {
          code: 140,
          ignorePattern: '^(import|export) .*$',
        },
      ],
      'new-parens': 'error',
      'newline-after-var': 'error',
      'newline-before-return': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-cond-assign': 'error',
      'no-console': 'off',
      'no-debugger': 'error',
      'no-empty': 'off',
      'no-eval': 'error',
      'no-fallthrough': 'off',
      'no-invalid-this': 'off',
      'no-new-wrappers': 'error',
      'no-throw-literal': 'error',
      'no-trailing-spaces': 'error',
      'no-undef-init': 'error',
      'no-underscore-dangle': 'off',
      'no-unsafe-finally': 'error',
      'no-unused-labels': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'one-var': [
        'error',
        'never',
      ],
      'prefer-const': 'error',
      quotes: [
        'error',
        'single',
      ],
      radix: 'error',
      semi: 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      'sort-keys': 'error',
      'spaced-comment': [
        'error',
        'always',
        {
          markers: [
            '/',
          ],
        },
      ],
      'use-isnan': 'error',
      'valid-typeof': 'off',
    },
  },
];
