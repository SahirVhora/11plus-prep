# Development dependency overrides

The TypeScript ESLint parser currently selects minimatch 10, which is affected by
GHSA-g3hv-75wg-m249. The scoped override selects minimatch 11.0.8 for
`@typescript-eslint/typescript-estree` while leaving ESLint's older minimatch 3
dependency unchanged. The published fix starts at 11.0.1.

Source: https://github.com/advisories/GHSA-g3hv-75wg-m249

Validation: clean installation, lint, API type checking, unit tests, region
validation, production build and npm audit. Remove the override once the upstream
parser requires a patched minimatch version.
