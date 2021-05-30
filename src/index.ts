import fetch from 'node-fetch';
import visit from 'unist-util-visit';
import { Transformer } from 'unified';
import { Node } from 'unist';
import extractTagSection from './utils/extractTagSection';
import extractMetadataArguments from './utils/extractMetadataArguments';

interface NodeWithMeta extends Node {
  meta?: string;
}

interface PluginOptions {
  sourceDomain?: string;
}

export function remarkFetchCode(options?: PluginOptions): Transformer {
  return async function transformer(tree): Promise<void> {
    const codeTypeNodes: NodeWithMeta[] = [];
    const promises = [];

    visit(tree, 'code', node => codeTypeNodes.push(node));

    for (const node of codeTypeNodes) {
      if (!node.meta) {
        return;
      }

      const { url, tag } = extractMetadataArguments(node.meta);

      if (!url) {
        return;
      }

      const urlWithDomainFromOptions = (options && options.sourceDomain) ? new URL(url, options.sourceDomain) : url;

      promises.push(
        new Promise((resolve, reject) => {
          fetch(urlWithDomainFromOptions.toString())
            .then(res => res.text())
            .then(fileContent => {
              node.value = extractTagSection(fileContent, tag).replace(/\t/g, ' ').trim();
              resolve(node);
            })
            .catch(err => reject(err));
        })
      );
    }

    if (promises.length) {
      await Promise.all(promises);
    }
  };
}
