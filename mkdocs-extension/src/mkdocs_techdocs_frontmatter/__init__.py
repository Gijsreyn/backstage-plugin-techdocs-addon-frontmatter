import html
import json
from typing import Any

import yaml
from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor


def _stringify(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, (list, tuple)):
        return ", ".join(_stringify(entry) for entry in value if _stringify(entry))
    if isinstance(value, dict):
        return json.dumps(value, default=str, ensure_ascii=False)
    return str(value)


def _default_label(key: str) -> str:
    return key.replace("_", " ").replace("-", " ").title()


def _as_bool(value: Any, default: bool) -> bool:
    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in ("true", "yes", "1", "on"):
            return True
        if normalized in ("false", "no", "0", "off"):
            return False

    return default


def _render_key(options: dict[str, Any]) -> str:
    return options.get("render_key") or "techdocs_frontmatter_render"


def _should_render(metadata: dict[str, Any], options: dict[str, Any]) -> bool:
    default_render = _as_bool(options.get("render"), True)
    render_key = _render_key(options)

    if render_key in metadata:
        return _as_bool(metadata[render_key], default_render)

    return default_render


def _select_items(metadata: dict[str, Any], options: dict[str, Any]) -> list[tuple[str, str, str]]:
    include = options.get("include") or metadata.keys()
    exclude = set(options.get("exclude") or [])
    labels = options.get("labels") or {}
    if options.get("exclude_render_key", True):
        exclude.add(_render_key(options))
    items = []

    for key in include:
        if key in exclude or key not in metadata:
            continue

        value = _stringify(metadata[key])
        if not value:
            continue

        items.append((key, labels.get(key) or _default_label(key), value))

    return items


def _render_metadata(metadata: dict[str, Any], options: dict[str, Any]) -> list[str]:
    items = _select_items(metadata, options)
    if not items:
        return []

    title = options.get("title") or "Article metadata"
    render = _should_render(metadata, options)
    payload = json.dumps(
        {key: value for key, _label, value in items},
        ensure_ascii=False,
    )
    if not render:
        lines = [
            '<div hidden data-techdocs-frontmatter data-techdocs-frontmatter-render="false">',
            f'  <code hidden data-techdocs-frontmatter-json>{html.escape(payload)}</code>',
            f'  <span>{html.escape(title)}</span>',
        ]

        for _key, label, value in items:
            lines.append(f'  <span>{html.escape(label)}: {html.escape(value)}</span>')

        lines.extend(['</div>', ''])
        return lines

    lines = [
        f'<aside class="techdocs-frontmatter" data-techdocs-frontmatter aria-label="{html.escape(title)}">',
        f'  <code hidden data-techdocs-frontmatter-json>{html.escape(payload)}</code>',
        f'  <p class="techdocs-frontmatter__heading">{html.escape(title)}</p>',
        '  <dl class="techdocs-frontmatter__list">',
    ]

    for key, label, value in items:
        lines.extend(
            [
                f'    <div class="techdocs-frontmatter__row" data-techdocs-frontmatter-key="{html.escape(key)}">',
                f'      <dt>{html.escape(label)}</dt>',
                f'      <dd>{html.escape(value)}</dd>',
                '    </div>',
            ],
        )

    lines.extend(['  </dl>', '</aside>', ''])
    return lines


class FrontmatterMetadataPreprocessor(Preprocessor):
    def __init__(self, options: dict[str, Any]) -> None:
        super().__init__()
        self.options = options

    def run(self, lines: list[str]) -> list[str]:
        if not lines or lines[0].strip() != '---':
            return lines

        end_index = next(
            (
                index
                for index, line in enumerate(lines[1:], start=1)
                if line.strip() in ('---', '...')
            ),
            None,
        )
        if end_index is None:
            return lines

        metadata = yaml.safe_load('\n'.join(lines[1:end_index])) or {}
        if not isinstance(metadata, dict):
            return lines

        metadata_lines = _render_metadata(metadata, self.options)
        if not metadata_lines:
            return lines

        return lines[: end_index + 1] + metadata_lines + lines[end_index + 1 :]


class FrontmatterMetadataExtension(Extension):
    config = {
        'title': ['Article metadata', 'Title shown above rendered frontmatter metadata.'],
        'render': [True, 'Whether to visibly render the metadata block in generated documentation.'],
        'render_key': ['techdocs_frontmatter_render', 'Frontmatter key that can override whether metadata is rendered for one page.'],
        'exclude_render_key': [True, 'Whether to omit the render control key from emitted/indexed frontmatter metadata.'],
        'include': [None, 'Only render these frontmatter keys, in this order.'],
        'exclude': [None, 'Hide these frontmatter keys.'],
        'labels': [{}, 'User-facing labels for frontmatter keys.'],
    }

    def extendMarkdown(self, md):
        md.preprocessors.register(
            FrontmatterMetadataPreprocessor(self.getConfigs()),
            'frontmatter_metadata',
            100,
        )


def makeExtension(**kwargs):
    return FrontmatterMetadataExtension(**kwargs)