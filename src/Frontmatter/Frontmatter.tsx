import { useEffect, useMemo } from 'react';
import { useShadowRootElements } from '@backstage/plugin-techdocs-react';
import { FrontmatterAddonProps } from './props';
import { getFrontmatterRows, normalizeFrontmatter } from './utils';

const defaultSourceSelector = '[data-techdocs-frontmatter]';
const payloadAttribute = 'data-techdocs-frontmatter-payload';
const payloadSelector = '[data-techdocs-frontmatter-json]';
const styleElementId = 'techdocs-frontmatter-addon-styles';

const styles = `
.techdocs-frontmatter {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.72);
  display: block;
  font-size: 0.8125rem;
  line-height: 1.5;
  margin: 0 0 1.5rem;
  padding: 0.75rem 0;
}

.techdocs-frontmatter__heading {
  color: rgba(0, 0, 0, 0.54);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.techdocs-frontmatter__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0;
}

.techdocs-frontmatter__row {
  display: inline-flex;
  min-width: 0;
}

.techdocs-frontmatter__row::after {
  color: rgba(0, 0, 0, 0.38);
  content: "•";
  margin-left: 1rem;
}

.techdocs-frontmatter__row:last-child::after {
  content: "";
  margin-left: 0;
}

.techdocs-frontmatter dt {
  color: rgba(0, 0, 0, 0.54);
  font-weight: 600;
  margin: 0 0.35rem 0 0;
}

.techdocs-frontmatter dt::after {
  content: ":";
}

.techdocs-frontmatter dd {
  color: rgba(0, 0, 0, 0.82);
  margin: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
`;

const ensureStyles = (sourceElement: Element) => {
  const root = sourceElement.getRootNode();

  if (!(root instanceof ShadowRoot) || root.getElementById(styleElementId)) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = styleElementId;
  styleElement.textContent = styles;
  root.appendChild(styleElement);
};

const getPayload = (sourceElement: Element) => {
  const existingPayload = sourceElement.getAttribute(payloadAttribute);
  if (existingPayload) {
    return existingPayload;
  }

  const payloadElement = sourceElement.querySelector(payloadSelector);
  const payload = payloadElement?.textContent?.trim();
  if (payload) {
    sourceElement.setAttribute(payloadAttribute, payload);
  }

  return payload;
};

const appendTextElement = (
  parent: Element,
  tagName: keyof HTMLElementTagNameMap,
  text: string,
) => {
  const element = document.createElement(tagName);
  element.textContent = text;
  parent.appendChild(element);
  return element;
};

const renderFrontmatter = (
  sourceElement: HTMLElement,
  props: FrontmatterAddonProps,
) => {
  if (
    props.render === false ||
    sourceElement.getAttribute('data-techdocs-frontmatter-render') === 'false'
  ) {
    sourceElement.innerHTML = '';
    sourceElement.hidden = true;
    return;
  }

  const payload = getPayload(sourceElement);
  const frontmatter = payload ? normalizeFrontmatter(JSON.parse(payload)) : {};
  const rows = getFrontmatterRows(frontmatter, props);

  if ((props.hideEmpty ?? true) && rows.length === 0) {
    sourceElement.innerHTML = '';
    sourceElement.hidden = true;
    return;
  }

  sourceElement.hidden = false;
  sourceElement.className = 'techdocs-frontmatter';
  sourceElement.setAttribute('aria-label', props.title ?? 'Article metadata');
  sourceElement.innerHTML = '';

  const payloadElement = document.createElement('code');
  payloadElement.hidden = true;
  payloadElement.setAttribute('data-techdocs-frontmatter-json', '');
  payloadElement.textContent = payload ?? '{}';
  sourceElement.appendChild(payloadElement);

  appendTextElement(
    sourceElement,
    'p',
    props.title ?? 'Article metadata',
  ).className = 'techdocs-frontmatter__heading';

  const list = document.createElement('dl');
  list.className = 'techdocs-frontmatter__list';
  sourceElement.appendChild(list);

  rows.forEach(row => {
    const rowElement = document.createElement('div');
    rowElement.className = 'techdocs-frontmatter__row';
    rowElement.setAttribute('data-techdocs-frontmatter-key', row.key);
    list.appendChild(rowElement);

    appendTextElement(rowElement, 'dt', row.label);
    appendTextElement(rowElement, 'dd', row.value);
  });
};

export const FrontmatterAddon = (props: FrontmatterAddonProps) => {
  const sourceSelector = props.sourceSelector ?? defaultSourceSelector;
  const sourceElements = useShadowRootElements<HTMLElement>([sourceSelector]);

  // Stabilize the effect on the *content* of props so that a parent
  // re-render that produces a new object identity but identical values
  // does not force us to rewrite the DOM.
  const propsKey = useMemo(
    () =>
      JSON.stringify({
        title: props.title ?? null,
        render: props.render ?? null,
        include: props.include ?? null,
        exclude: props.exclude ?? null,
        labels: props.labels ?? null,
        sourceSelector: props.sourceSelector ?? null,
        hideEmpty: props.hideEmpty ?? null,
      }),
    [
      props.title,
      props.render,
      props.include,
      props.exclude,
      props.labels,
      props.sourceSelector,
      props.hideEmpty,
    ],
  );

  useEffect(() => {
    sourceElements.forEach(sourceElement => {
      try {
        ensureStyles(sourceElement);
        renderFrontmatter(sourceElement, props);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to render TechDocs frontmatter metadata', error);
      }
    });
    // propsKey serializes the relevant fields of `props`, so intentionally
    // omit `props` itself to avoid rerunning on unrelated identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsKey, sourceElements]);

  return null;
};