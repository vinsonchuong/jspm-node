import {childProcess} from 'node-promise-es6';

describe('jspm-node', () => {
  it('outputs "Hello World!"', async () => {
    const {stdout} = await childProcess.exec('jspm-node');
    expect(stdout.trim()).toBe('Hello World!');
  });
});
