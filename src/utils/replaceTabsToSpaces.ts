import {EOL} from 'os';

export default function replaceTabsToSpaces(content: string) {
  const lines = content.split(EOL);

  return lines
    .map((line) => line.replace(/\t/g, '  '))
    .join(EOL);
}
