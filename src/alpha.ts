import { createElement } from 'react';
import {
  configApiRef,
  createFrontendModule,
  useApi,
} from '@backstage/frontend-plugin-api';
import {
  AddonBlueprint,
  TechDocsAddonOptions,
} from '@backstage/plugin-techdocs-react/alpha';
import { FrontmatterAddon, FrontmatterAddonProps } from './Frontmatter';

const ConfiguredFrontmatterAddon = () => {
  const config = useApi(configApiRef);
  const frontmatterConfig = config.getOptionalConfig(
    'techdocs.addons.frontmatter',
  );

  const props: FrontmatterAddonProps = {};

  if (frontmatterConfig) {
    props.title = frontmatterConfig.getOptionalString('title');
    props.render = frontmatterConfig.getOptionalBoolean('render');
    props.include = frontmatterConfig.getOptionalStringArray('include');
    props.exclude = frontmatterConfig.getOptionalStringArray('exclude');
    props.labels = frontmatterConfig.getOptional<Record<string, string>>('labels');
    props.sourceSelector = frontmatterConfig.getOptionalString('sourceSelector');
    props.hideEmpty = frontmatterConfig.getOptionalBoolean('hideEmpty');
  }

  return createElement(FrontmatterAddon, props);
};

const frontmatterAddonParams: TechDocsAddonOptions = {
  name: 'Frontmatter',
  location: 'Content',
  component: ConfiguredFrontmatterAddon,
};

export const techDocsFrontmatterAddon = AddonBlueprint.make({
  name: 'frontmatter',
  params: frontmatterAddonParams,
});

export const techDocsFrontmatterAddonModule = createFrontendModule({
  pluginId: 'techdocs',
  extensions: [techDocsFrontmatterAddon],
});

export { techDocsFrontmatterAddonModule as default };