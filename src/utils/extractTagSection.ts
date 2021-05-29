import {EOL} from 'os';

export default function extractTagSection(content: string, codeTag?: string) {
  if (!codeTag) {
    return content;
  }

  const lines = content.split(EOL);
  let indexOfStartString = 0;
  let indexOfLastString = lines.length;

  lines.forEach((line, index) => {
    if (line.includes(`START ${codeTag}`)) {
      indexOfStartString = index + 1;
    }

    if (line.includes(`END ${codeTag}`)) {
      indexOfLastString = index;
    }
  })

  return lines.slice(indexOfStartString, indexOfLastString).join('\n');
}
