export interface Config {
  techdocs?: {
    addons?: {
      frontmatter?: {
        /**
         * Title shown above the rendered frontmatter metadata block.
         * @default Article metadata
         */
        title?: string;

        /**
         * Whether to visibly render generated frontmatter in TechDocs.
         * Set to false when metadata should only be indexed/available to search.
         * @default true
         */
        render?: boolean;

        /**
         * Display style for the metadata block.
         * Supported values: learn, table.
         * @default learn
         */
        variant?: string;

        /**
         * Only render these frontmatter keys, in this order.
         */
        include?: string[];

        /**
         * Hide these frontmatter keys.
         */
        exclude?: string[];

        /**
         * User-facing labels for frontmatter keys.
         */
        labels?: {
          [key: string]: string;
        };

        /**
         * Selector used to find the JSON metadata payload in the TechDocs shadow root.
         * @default [data-techdocs-frontmatter]
         */
        sourceSelector?: string;

        /**
         * Hide the addon when the page has no metadata.
         * @default true
         */
        hideEmpty?: boolean;
      };
    };
  };
}