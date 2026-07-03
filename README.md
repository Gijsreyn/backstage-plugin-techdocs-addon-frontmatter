# backstage-plugin-techdocs-addon-frontmatter

Render YAML frontmatter metadata inside Backstage TechDocs.

This package is a TechDocs addon plus a small MkDocs companion plugin. The MkDocs plugin emits page frontmatter as visible, semantic document metadata during generation, so static search indexes can find it. The TechDocs addon enhances that generated block inside the TechDocs shadow root.

## Installation

```sh
yarn --cwd packages/app add backstage-plugin-techdocs-addon-frontmatter
```

## New Frontend System

```ts
import techDocsPlugin from '@backstage/plugin-techdocs/alpha';
import { techDocsFrontmatterAddonModule } from 'backstage-plugin-techdocs-addon-frontmatter';

export default createApp({
  features: [techDocsPlugin, techDocsFrontmatterAddonModule],
});
```

## Legacy Frontend System

```tsx
import { Frontmatter } from 'backstage-plugin-techdocs-addon-frontmatter';

<TechDocsAddons>
  <Frontmatter title="Article metadata" />
</TechDocsAddons>
```

## Make Metadata Searchable

Browser-side TechDocs addons run after MkDocs has generated and indexed the page, so they cannot make metadata searchable by themselves. Use the included MkDocs plugin in your TechDocs generator image to inject frontmatter before MkDocs writes HTML and `search/search_index.json`.

Build a TechDocs image with the companion plugin installed:

```sh
docker build -t techdocs-frontmatter:local plugins/backstage-plugin-techdocs-addon-frontmatter/mkdocs-extension
```

Use that image for local generation or preview:

```sh
npx @techdocs/cli generate --docker-image techdocs-frontmatter:local --no-pull
npx @techdocs/cli serve --docker-image techdocs-frontmatter:local --preview-app-bundle-path packages/techdocs-preview/dist
```

For production, install the Python package from `mkdocs-extension` into the image/environment that runs MkDocs.

Configure the MkDocs plugin in `mkdocs.yml`:

`mkdocs.yml`:

```yaml
plugins:
  - techdocs-core
  - techdocs-frontmatter:
      title: Article metadata
      render: true
      include: [type, last_review_date]
      labels:
        type: Type
        last_review_date: Last reviewed
```

The plugin writes a compact definition list into the generated document, similar to metadata summaries used by documentation sites. Because this HTML is part of the generated page, MkDocs search and TechDocs static indexing can discover values such as `How-To`, `Last reviewed`, and `2026-03-07`.

Set `render: false` when frontmatter should be searchable and available to the collator/indexer but not visibly shown in the rendered documentation:

```yaml
plugins:
  - techdocs-core
  - techdocs-frontmatter:
      render: false
```

With `render: false`, the plugin emits a hidden metadata payload before MkDocs builds the search index. The page will not show the metadata block, but the static search index and backend collator transformer can still read arbitrary key/value pairs such as `author: Gijs Reijn`.

Docs authors can also opt out per page by setting the configured render key in frontmatter:

```yaml
---
type: How-To
author: Gijs Reijn
techdocs_frontmatter_render: false
---
```

The render key defaults to `techdocs_frontmatter_render`, but platform owners can rename it:

```yaml
plugins:
  - techdocs-core
  - techdocs-frontmatter:
      render_key: show_metadata
```

Then authors can use:

```yaml
---
author: Gijs Reijn
show_metadata: false
---
```

The render-control key is omitted from the emitted metadata payload and search index by default. Set `exclude_render_key: false` if you intentionally want that control key indexed too.

## Structured Search Metadata

The frontend addon and MkDocs plugin make frontmatter visible and searchable as page text. To make arbitrary frontmatter key/value pairs available to the Backstage TechDocs collator/indexer as structured metadata, register a backend module that uses `techdocsCollatorEntityTransformerExtensionPoint.setDocumentTransformer`.

This repository includes a local example at `packages/backend/src/modules/searchTechdocsFrontmatter.ts` and registers it before the stock TechDocs collator:

```ts
backend.add(import('./modules/searchTechdocsFrontmatter'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));
```

For frontmatter such as:

```yaml
---
type: How-To
author: Gijs Reijn
last_review_date: 2026-03-07
---
```

the indexed TechDocs document receives structured fields like:

```json
{
  "frontmatter": {
    "type": "How-To",
    "author": "Gijs Reijn",
    "last_review_date": "2026-03-07"
  },
  "frontmatter_type": "How-To",
  "frontmatter_author": "Gijs Reijn",
  "frontmatter_last_review_date": "2026-03-07"
}
```

That gives search engines and custom result UIs a stable place to filter or display arbitrary frontmatter values. The exact query/filter syntax depends on the configured Backstage search engine.

## Configuration

Frontend addon configuration is read from `app-config.yaml` when using the new frontend system:

```yaml
techdocs:
  addons:
    frontmatter:
      title: Article metadata
      render: true
      include: [type, last_review_date]
      labels:
        type: Type
        last_review_date: Last reviewed
```

The MkDocs plugin supports `title`, `render`, `include`, `exclude`, and `labels` options at generation time. Use the MkDocs plugin options to control what gets emitted and indexed; use the frontend addon options to control how the generated block is enhanced or hidden in TechDocs.

## Contributors Guide

This plugin can be developed in the context of an existing Backstage deployment or a [new local deployment](https://backstage.io/docs/getting-started/#1-create-your-backstage-app).

### Setup for Development

1. Fork and clone this repo.
2. Run `yarn install` at the repo root.
3. Run `yarn tsc` and `yarn test` to verify the environment.
4. Run `yarn start` to launch the dev harness at `dev/index.tsx`.

### Manual Testing

You can register the included `sampledocs/` component in a Backstage instance to try the addon end-to-end. Point a URL-based catalog import at `sampledocs/catalog-info.yaml` (from a fork/branch of this repo) and view its TechDocs.

## License

This project is licensed under the [MIT License](./LICENSE).
