import {EOL} from 'os';

export default function extractTagSection(content: string, codeTag?: string) {
  if (!codeTag) {
    return content;
  }

  const lines = content.split(EOL);
  const tagFragmentLines = getTagSection(lines, codeTag);
  const formattedLines = removeNonSpaceOnStart(tagFragmentLines);
  return formattedLines.join(EOL);
}

function getTagSection(lines: string[], codeTag: string): string[] {
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

function removeNonSpaceOnStart(lines: string[]): string[] {
  let minimumSpaceCharacters: number | undefined;

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

  return lines.map(line => line.slice(minimumSpaceCharacters))
}
