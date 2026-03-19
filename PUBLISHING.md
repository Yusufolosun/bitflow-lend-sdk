# Publishing Guide

## Pre-Publishing Checklist

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] README is up to date
- [ ] Version bumped in package.json
- [ ] CHANGELOG updated (if exists)

## Publishing to npm

### 1. Login to npm

```bash
npm login
```

### 2. Publish Package

```bash
npm publish
```

For first-time publish:
```bash
npm publish --access public
```

## Publishing to GitHub Packages

### 1. Add GitHub registry to package.json

Add this to package.json:
```json
"publishConfig": {
  "registry": "https://npm.pkg.github.com/@YourGitHubUsername"
}
```

### 2. Create .npmrc (DO NOT COMMIT)

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### 3. Publish

```bash
npm publish
```

## Versioning

Follow semantic versioning:
- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features, backwards compatible (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (1.0.0 → 1.0.1)

Update version:
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

## Post-Publishing

1. Create GitHub release
2. Tag the release with version
3. Update documentation
4. Announce on community channels

## Troubleshooting

### Package name already exists
- Choose a unique name or scope: `@username/bitflow-lend-sdk`

### Authentication failed
- Ensure you're logged in: `npm whoami`
- Verify tokens are valid

### Build errors
- Clean and rebuild: `rm -rf dist node_modules && npm install && npm run build`
