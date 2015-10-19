import {exec} from 'node-promise-es6/child-process';

describe('jspm-node', function() {
  it('outputs "3...2...1...Hello World!"', async function() {
    const {stdout} = await exec('jspm-node');
    expect(stdout.trim()).toBe('3...2...1...Hello World!');
  });
});
