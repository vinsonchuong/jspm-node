import * as fse from 'fs-extra-promise-es6';
import jspm from 'jspm';
import jspmCore from 'jspm/lib/core';

async function run() {
  const packageJson = await fse.readJson('package.json');

  jspm.setPackagePath('.');
  await jspmCore.init(null, false);

  for (const dependency of Object.keys(packageJson.dependencies || {})) {
    await jspm.install(dependency, `npm:${dependency}`);
  }
  await fse.writeJson('package.json', packageJson);
}

run().catch(error => {
  process.stderr.write((error.stack || error) + '\n');
  process.exit(1);
});
