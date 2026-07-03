# Changelog

## [v0.1.2](https://github.com/Gijsreyn/backstage-plugin-techdocs-addon-frontmatter/releases/tag/v0.1.2) - 2026-07-03

First release published to npm.

### Changes

- Backstage TechDocs addon that renders YAML frontmatter as a metadata block
  inside the TechDocs shadow root, with `title`, `render`, `include`,
  `exclude`, `labels`, `sourceSelector`, and `hideEmpty` controls.
- Companion `mkdocs-techdocs-frontmatter` MkDocs plugin that emits the same
  frontmatter as indexable HTML so MkDocs and TechDocs search indexes can
  discover it.
- Dockerfile that layers the MkDocs plugin on `python:3.14-slim` with
  `mkdocs-techdocs-core`.
- End-to-end release automation via release-drafter with auto-updated
  `CHANGELOG.md` and `yarn npm publish`.
- Workflow: reclaim workspace ownership after container-based actions so the
  `CHANGELOG.md` auto-commit step can write to `.git/objects`.

