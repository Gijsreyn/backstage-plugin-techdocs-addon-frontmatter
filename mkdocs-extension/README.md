# mkdocs-techdocs-frontmatter

A [MkDocs](https://www.mkdocs.org/) plugin that emits YAML frontmatter from
Markdown pages as visible, indexable metadata during TechDocs generation.

Companion to the
[`backstage-plugin-techdocs-addon-frontmatter`](https://github.com/Gijsreyn/backstage-plugin-techdocs-addon-frontmatter)
Backstage TechDocs addon. See the repository README for full usage,
configuration, and integration with Backstage search.

## Install

```sh
pip install mkdocs-techdocs-frontmatter
```

## Enable

```yaml
# mkdocs.yml
plugins:
  - techdocs-core
  - techdocs-frontmatter:
      title: Article metadata
      render: true
      include: [type, author, last_review_date]
      labels:
        type: Type
        author: Author
        last_review_date: Last reviewed
```

## License

MIT
