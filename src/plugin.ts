import { createPlugin } from '@backstage/core-plugin-api';
import {
  createTechDocsAddonExtension,
  TechDocsAddonLocations,
} from '@backstage/plugin-techdocs-react';
import { FrontmatterAddon, FrontmatterAddonProps } from './Frontmatter';

export const techdocsAddonFrontmatterPlugin = createPlugin({
  id: 'techdocs-addon-frontmatter',
});

export const Frontmatter = techdocsAddonFrontmatterPlugin.provide(
  createTechDocsAddonExtension<FrontmatterAddonProps>({
    name: 'Frontmatter',
    location: TechDocsAddonLocations.Content,
    component: FrontmatterAddon,
  }),
);