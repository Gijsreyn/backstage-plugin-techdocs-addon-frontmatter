import { createDevApp } from '@backstage/dev-utils';
import { techdocsAddonFrontmatterPlugin } from '../src/plugin';

createDevApp().registerPlugin(techdocsAddonFrontmatterPlugin).render();
