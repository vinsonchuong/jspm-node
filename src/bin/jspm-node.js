import * as fse from 'fs-extra-promise-es6';
import jspm from 'jspm';
import jspmCore from 'jspm/lib/core';

async function run() {
  jspm.setPackagePath('.');
  await jspmCore.init(null, false);

  const packageJson = await fse.readJson('package.json');
  for (const dependency of Object.keys(packageJson.dependencies || {})) {
    await jspm.install(dependency, `npm:${dependency}`);
  }
}

run().catch(error => {
  process.stderr.write((error.stack || error) + '\n');
  process.exit(1);
});
