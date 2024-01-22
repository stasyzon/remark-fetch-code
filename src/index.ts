import fetch from 'node-fetch';
import visit from 'unist-util-visit';
import { Transformer } from 'unified';
import { Node } from 'unist';
import urlJoin from 'url-join';
import extractTagSection from './utils/extractTagSection';
import extractMetadataArguments from './utils/extractMetadataArguments';
import replaceTabsToSpaces from './utils/replaceTabsToSpaces';

interface NodeWithMeta extends Node {
  meta?: string;
}

interface PluginOptions {
  pathPrefix?: string;
  replaceTabsToSpaces?: boolean
}

export default function remarkFetchCode(options?: PluginOptions): Transformer {
  return async function transformer(tree): Promise<void> {
    const codeTypeNodes: NodeWithMeta[] = [];
    const promises = [];

    visit(tree, 'code', node => codeTypeNodes.push(node));

    for (const node of codeTypeNodes) {
      if (!node.meta) {
        promises.push(new Promise((resolve) => resolve(node)));
        continue;
      }

      const { url, tag } = extractMetadataArguments(node.meta);

      if (!url) {
        promises.push(new Promise((resolve) => resolve(node)));
        continue;
      }

      const urlWithDomainFromOptions = (options && options.pathPrefix) ?
        urlJoin(options.pathPrefix, url) :
        url;

      promises.push(
        new Promise((resolve, reject) => {
          fetch(urlWithDomainFromOptions)
            .then(res => {
              if (res.status !== 200) {
                console.log(`Error fetching ${urlWithDomainFromOptions} - status ${res.status}`);
              }
              return res.text();
            })
            .then(fileContent => {
              node.value = extractTagSection(fileContent, tag);
              if (options?.replaceTabsToSpaces) {
                node.value = replaceTabsToSpaces(node.value as string);
              }
              resolve(node);
            })
            .catch(err => {
              console.log(`Error fetching ${urlWithDomainFromOptions}`);
              reject(err);
            });
        })
      );
    }

    if (promises.length) {
      await Promise.all(promises);
    }
  };
}
