export type FrontmatterValue =
  | string
  | number
  | boolean
  | null
  | FrontmatterValue[]
  | { [key: string]: FrontmatterValue };

export type FrontmatterData = Record<string, FrontmatterValue>;

export type FrontmatterAddonProps = {
  title?: string;
  render?: boolean;
  variant?: 'learn' | 'table';
  include?: string[];
  exclude?: string[];
  labels?: Record<string, string>;
  sourceSelector?: string;
  hideEmpty?: boolean;
};