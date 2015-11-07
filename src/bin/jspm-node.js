import * as fse from 'fs-extra-promise-es6';
import path from 'path';
import jspm from 'jspm';
import jspmCore from 'jspm/lib/core';
import JspmRegistry from 'jspm-registry';

async function run() {
  const tmpDir = path.resolve('/tmp/jspm-node');
  const registryDir = path.resolve(tmpDir, 'registry');

  const packageJson = await fse.readJson('package.json');

  jspm.setPackagePath('.');
  await jspmCore.init(null, false);

  await fse.ensureDir(registryDir);
  const jspmRegistry = new JspmRegistry({tmpDir: registryDir}, console);

  for (const dependency of Object.keys(packageJson.dependencies || {})) {
    const {redirect: jspmName} = await jspmRegistry.locate(dependency);
    await jspm.install(dependency, jspmName || `npm:${dependency}`);
  }
  await fse.writeJson('package.json', packageJson, {spaces: 2});
}

run().catch(error => {
  process.stderr.write((error.stack || error) + '\n');
  process.exit(1);
});
