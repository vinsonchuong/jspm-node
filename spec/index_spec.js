import jspmNode from 'jspm-node';

describe('jspm-node', function() {
  it('exports "Hello World!"', function() {
    expect(jspmNode).toBe('Hello World!');
  });
});
