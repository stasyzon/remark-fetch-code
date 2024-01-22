'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fetch = _interopDefault(require('node-fetch'));
var visit = _interopDefault(require('unist-util-visit'));
var urlJoin = _interopDefault(require('url-join'));
var os = require('os');

function extractTagSection(content, codeTag) {
  if (!codeTag) {
    return content;
  }

  const lines = content.split(os.EOL);
  const tagFragmentLines = getTagSection(lines, codeTag);
  const formattedLines = removeNonSpaceOnStart(tagFragmentLines);
  return formattedLines.join(os.EOL);
}

function getTagSection(lines, codeTag) {
  let indexOfStartString = 0;
  let indexOfLastString = lines.length;
  lines.forEach((line, index) => {
    if (line.includes(`START ${codeTag}`)) {
      indexOfStartString = index + 1;
    }

    if (line.includes(`END ${codeTag}`)) {
      indexOfLastString = index;
    }
  });
  return lines.slice(indexOfStartString, indexOfLastString);
}

function removeNonSpaceOnStart(lines) {
  let minimumSpaceCharacters;
  lines.forEach(line => {
    const spaceMatchOnStringStart = line.match(/^\s+/);

    if (!line) {
      return;
    }

    if (!spaceMatchOnStringStart || !spaceMatchOnStringStart[0]) {
      minimumSpaceCharacters = 0;
      return;
    }

    if (minimumSpaceCharacters === undefined) {
      minimumSpaceCharacters = spaceMatchOnStringStart[0].length;
    }

    if (spaceMatchOnStringStart[0].length > 0 && spaceMatchOnStringStart[0].length < minimumSpaceCharacters) {
      minimumSpaceCharacters = spaceMatchOnStringStart[0].length;
    }
  });
  return lines.map(line => line.slice(minimumSpaceCharacters));
}

function extractMetadataArguments(meta = '') {
  const metadataArguments = meta.split(' ');
  let url;
  let tag;

  for (const argumentString of metadataArguments) {
    if (argumentString.startsWith('url=')) {
      url = argumentString.replace('url=', '');
    }

    if (argumentString.startsWith('tag=')) {
      tag = argumentString.replace('tag=', '');
    }
  }

  return {
    url,
    tag
  };
}

function replaceTabsToSpaces(content) {
  const lines = content.split(os.EOL);
  return lines.map(line => line.replace(/\t/g, '  ')).join(os.EOL);
}

function remarkFetchCode(options) {
  return async function transformer(tree) {
    const codeTypeNodes = [];
    const promises = [];
    visit(tree, 'code', node => codeTypeNodes.push(node));

    for (const node of codeTypeNodes) {
      if (!node.meta) {
        promises.push(new Promise(resolve => resolve(node)));
        continue;
      }

      const {
        url,
        tag
      } = extractMetadataArguments(node.meta);

      if (!url) {
        promises.push(new Promise(resolve => resolve(node)));
        continue;
      }

      const urlWithDomainFromOptions = options && options.pathPrefix ? urlJoin(options.pathPrefix, url) : url;
      promises.push(new Promise((resolve, reject) => {
        fetch(urlWithDomainFromOptions).then(res => {
          if (res.status !== 200) {
            console.log(`Error fetching ${urlWithDomainFromOptions} - status ${res.status}`);
          }

          return res.text();
        }).then(fileContent => {
          node.value = extractTagSection(fileContent, tag);

          if (options != null && options.replaceTabsToSpaces) {
            node.value = replaceTabsToSpaces(node.value);
          }

          resolve(node);
        }).catch(err => {
          console.log(`Error fetching ${urlWithDomainFromOptions}`);
          reject(err);
        });
      }));
    }

    if (promises.length) {
      await Promise.all(promises);
    }
  };
}

exports.default = remarkFetchCode;
//# sourceMappingURL=remark-fetch-code.cjs.development.js.map
