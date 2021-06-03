jest.mock('node-fetch');

import fetch from 'node-fetch';
import remarkFetchCode from '../index';
import remark from 'remark';

const {Response} = jest.requireActual('node-fetch');
const mockedFetch = <jest.Mock<typeof Response>><unknown>fetch;

// describe('Basic checks', () => {
//   beforeEach(() => mockedFetch.mockReturnValueOnce(Promise.resolve(new Response())));
//   afterEach(() => mockedFetch.mockReset());
//
//   test('should call fetch if source have code type node with url metadata', async () => {
//     await remark().use(remarkFetchCode).process('```js url=example.com\n```');
//
//     expect(mockedFetch).toBeCalled();
//   })
//
//   test('should not call fetch if node does not contain meta', async () => {
//     await remark().use(remarkFetchCode).process('```js\n```');
//
//     expect(mockedFetch).not.toBeCalled();
//   })
//
//   test('should not call fetch if node does not contain url in meta', async () => {
//     await remark().use(remarkFetchCode).process('```js something=example.com\n```');
//
//     expect(mockedFetch).not.toBeCalled();
//   })
// });
//
// describe('Options checks', () => {
//   beforeEach(() => mockedFetch.mockReturnValueOnce(Promise.resolve(new Response())));
//   afterEach(() => mockedFetch.mockReset());
//
//   describe('pathPrefix', function () {
//     test('should form a path if pathPrefix is domain', async () => {
//       await remark()
//         .use(remarkFetchCode, {pathPrefix: 'https://example.com'})
//         .process('```js url=/path/to/code.js\n```');
//
//       expect(mockedFetch).toBeCalledWith('https://example.com/path/to/code.js');
//     })
//
//     test('should form a path if pathPrefix is domain with / on end', async () => {
//       await remark()
//         .use(remarkFetchCode, {pathPrefix: 'https://example.com/'})
//         .process('```js url=/path/to/code.js\n```');
//
//       expect(mockedFetch).toBeCalledWith('https://example.com/path/to/code.js');
//     })
//
//     test('should form a path if pathPrefix domain with pathname', async () => {
//       await remark()
//         .use(remarkFetchCode, {pathPrefix: 'https://example.com/example/'})
//         .process('```js url=/path/to/code.js\n```');
//
//       expect(mockedFetch).toBeCalledWith('https://example.com/example/path/to/code.js');
//     })
//   });
// });

describe('Transform checks', () => {
  afterEach(() => mockedFetch.mockReset());

  test('should insert received code for single code entry', async () => {
    mockedFetch.mockReturnValueOnce(Promise.resolve(new Response('const a = 1')))

    const result = await remark()
      .use(remarkFetchCode)
      .process('```js url=/path/to/code.js\n```');

    expect(result.contents).toEqual('```js url=/path/to/code.js\nconst a = 1\n```\n');
  })

  test('should insert received code for multiple code entry', async () => {
    mockedFetch.mockReturnValueOnce(Promise.resolve(new Response('const a = 1')))
    mockedFetch.mockReturnValueOnce(Promise.resolve(new Response('const b = 1')))

    const result = await remark()
      .use(remarkFetchCode)
      .process('```js url=/path/to/code.js\n```\n\n```js url=/path/to/anothercode.js\n```');

    expect(result.contents).toEqual(
      '```js url=/path/to/code.js\nconst a = 1\n```\n\n```js url=/path/to/anothercode.js\nconst b = 1\n```\n'
    );
  })

  test('should remove unnecessary tabs', async () => {
    mockedFetch.mockReturnValueOnce(Promise.resolve(new Response('\t\tconst a = 1\n\t\t\tconst b = 1')))

    const result = await remark()
      .use(remarkFetchCode)
      .process('```js url=/path/to/code.js\n```');

    expect(result.contents).toEqual(
      'ASAS'
    );
  })
});
