import fetch from 'node-fetch'
import {visit} from 'unist-util-visit';
import {Transformer} from 'unified';
import {Node} from 'unist';
import extractTagSection from './utils/extractTagSection';
import extractMetadataArguments from './utils/extractMetadataArguments';

interface NodeWithMeta extends Node {
  meta?: string;
}

export function remarkFetchCode(): Transformer {
  return function transformer(node): void {
    const codes: [NodeWithMeta, number | null, NodeWithMeta | null][] = [];
    const promises = [];

    visit(node, 'code', (node, index, parent) => codes.push([node, index, parent]));

    for (const [node] of codes) {
      if (!node.meta) {
        throw new Error(`Not found meta information`);
      }

      const {url, tag} = extractMetadataArguments(node.meta);
      promises.push(
        new Promise((resolve, reject) => {
          fetch(url)
            .then(res => res.text())
            .then(fileContent => {
              node.value = extractTagSection(fileContent, tag).trim();
              resolve(undefined);
            })
            .catch(err => reject(err));
        })
      );
    }

    if (promises.length) {
      Promise.all(promises);
    }
  };
}
