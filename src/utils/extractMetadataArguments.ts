export default function extractMetadataArguments(
  meta = ''
): { url: string | undefined; tag: string | undefined } {
  const metadataArguments = meta.split(' ');
  let url: string | undefined;
  let tag: string | undefined;

  for (const argumentString of metadataArguments) {
    if (argumentString.startsWith('url=')) {
      url = argumentString.replace('url=', '');
    }

    if (argumentString.startsWith('tag=')) {
      tag = argumentString.replace('tag=', '');
    }
  }

  return { url, tag };
}
