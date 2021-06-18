import { Transformer } from 'unified';
interface PluginOptions {
    pathPrefix?: string;
    replaceTabsToSpaces?: boolean;
}
export default function remarkFetchCode(options?: PluginOptions): Transformer;
export {};
