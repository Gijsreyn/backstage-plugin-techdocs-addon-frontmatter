# Contributing

Thanks for considering a contribution! This repo ships two related packages:

- **`backstage-plugin-techdocs-addon-frontmatter`** — the Backstage TechDocs
  addon (TypeScript / React), rooted at the repository root.
- **`mkdocs-techdocs-frontmatter`** — the companion MkDocs plugin (Python), in
  [`mkdocs-extension/`](./mkdocs-extension).

## How to contribute

1. **Open an issue first** for anything beyond a small fix so we can agree on
   the approach before you invest time.
2. **Fork and branch off `main`.** Use a short, descriptive branch name
   (`fix/…`, `feat/…`, `docs/…`).
3. **Make focused changes.** Keep unrelated refactors, formatting sweeps, and
   dependency bumps out of feature PRs.
4. **Open a PR against `main`.** Fill in the description with what changed and
   why. Link the related issue.
5. **Label your PR** so the release notes categorize it correctly (see
   [`.github/release-drafter.yml`](./.github/release-drafter.yml)):
   - `feature` / `enhancement`
   - `fix` / `bug` / `bugfix`
   - `docs` / `documentation`
   - `chore` / `dependencies` / `refactor`
   - `skip-changelog` — omit from release notes and `CHANGELOG.md`
6. **Wait for CI to go green.** The
   [`CI` workflow](./.github/workflows/ci.yml) runs `yarn tsc:full`,
   `yarn build`, `yarn test` on Node 22 and 24, and builds the Python sdist
   and wheel for the MkDocs extension.

### Local development

Prerequisites: Node.js 22 or 24, Corepack enabled (`corepack enable`), and
Python 3.14+ if you're touching `mkdocs-extension/`.

```sh
# Frontend addon
corepack enable
yarn install
yarn tsc          # typecheck
yarn test         # jest
yarn build        # produce dist/
yarn start        # launch dev harness at dev/index.tsx

# MkDocs extension
cd mkdocs-extension
python -m pip install -e .
```

There is also a demo docs site under [`sampledocs/`](./sampledocs) you can
register in a Backstage instance for end-to-end testing.

## How a release is created

Releases are fully automated by
[`.github/workflows/publish.yml`](./.github/workflows/publish.yml) whenever a
version bump lands on `main`. The trigger is the `version` field in
[`package.json`](./package.json) — if it doesn't match the latest git tag,
the workflow runs.
