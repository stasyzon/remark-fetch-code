import extractTagSection from '../extractTagSection';

describe('extractTagSection', () => {
  it('should return the original text in case tag is not provided', () => {
    const testString = 'Simple string';

    const result = extractTagSection(testString);
    expect(result).toEqual(testString);
  });

  it('should return a portion of the original text from line 1 to the line with the end tag in the absence of a start tag', () => {
    const testString = 'first line\nsecond line\n[END REGION_1]\nthird line';

    const result = extractTagSection(testString, 'REGION_1');
    expect(result).toEqual('first line\nsecond line');
  });

  it('should return a portion of the original text from line with start tag to last line in the absence of a end tag', () => {
    const testString = 'first line\n[START REGION_1]\nSecond line\nThird line';

    const result = extractTagSection(testString, 'REGION_1');
    expect(result).toEqual('Second line\nThird line');
  });
});
