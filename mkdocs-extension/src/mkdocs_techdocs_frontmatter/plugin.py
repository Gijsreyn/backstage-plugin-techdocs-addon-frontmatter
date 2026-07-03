from typing import Any

from mkdocs.config import config_options
from mkdocs.plugins import BasePlugin

from mkdocs_techdocs_frontmatter import _render_metadata


class TechDocsFrontmatterPlugin(BasePlugin):
    config_scheme = (
        ('title', config_options.Type(str, default='Article metadata')),
        ('render', config_options.Type(bool, default=True)),
        ('render_key', config_options.Type(str, default='techdocs_frontmatter_render')),
        ('exclude_render_key', config_options.Type(bool, default=True)),
        ('include', config_options.Type(list, default=[])),
        ('exclude', config_options.Type(list, default=[])),
        ('labels', config_options.Type(dict, default={})),
    )

    def on_page_markdown(self, markdown: str, page: Any, config: Any, files: Any) -> str:
        metadata = getattr(page, 'meta', None) or {}
        metadata_lines = _render_metadata(metadata, self.config)

        if not metadata_lines:
            return markdown

        rendered = '\n'.join(metadata_lines)
        return f"{rendered}\n{markdown}"