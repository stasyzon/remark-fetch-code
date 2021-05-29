export default function extractMetadataArguments(meta = ''): {url: string, tag: string | undefined} {
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

  if (!url) {
    throw new Error('Cannot parse url meta argument')
  }

  return {url, tag}
}
