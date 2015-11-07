import path from 'path';
import {childProcess} from 'node-promise-es6';
import * as fse from 'fs-extra-promise-es6';

async function updateJson(filePath, overrides) {
  const absolutePath = path.resolve(filePath);
  const packageJson = await fse.readJson(absolutePath);
  await fse.writeJson(absolutePath, Object.assign(packageJson, overrides), {
    spaces: 2
  });
}

describe('jspm-node', () => {
  describe('for a new project', () => {
    beforeEach(async () => {
      await fse.mkdirs('project');
      await childProcess.exec('npm init -y', {cwd: 'project'});
      await updateJson('project/package.json', {
        scripts: {
          prepublish: 'babel-node ../src/bin/jspm-node.js'
        }
      });
    });

    it('does not break npm install', async () => {
      let successful;
      try {
        await childProcess.exec('npm install', {cwd: 'project'});
        successful = true;
      } catch (error) {
        successful = false;
      } finally {
        expect(successful).toBe(true);
      }
    }, 60000);

    describe('installing a package', () => {
      beforeEach(async () => {
        await updateJson('project/package.json', {
          dependencies: {
            lodash: '*'
          }
        });
        await childProcess.exec('npm install', {cwd: 'project'});
      }, 60000);

      it('installs both the npm and the jspm version of the package', async () => {
        expect(await fse.readJson(path.resolve('project/node_modules/lodash/package.json')))
          .toEqual(jasmine.objectContaining({name: 'lodash'}));

        const {stdout: version} = await childProcess.exec('npm show --json lodash version');
        expect(await fse.readJson(path.resolve(`project/jspm_packages/npm/lodash@${JSON.parse(version)}/package.json`)))
          .toEqual(jasmine.objectContaining({name: 'lodash'}));
      });

      it('does not add a jspm key to the package.json', async () => {
        const packageJson = await fse.readJson(path.resolve('project/package.json'));
        expect(packageJson.jspm).toBeUndefined();
      });

      it('can install again without the jspm key', async () => {
        await childProcess.exec('npm install', {cwd: 'project'});

        expect(await fse.readJson(path.resolve('project/node_modules/lodash/package.json')))
          .toEqual(jasmine.objectContaining({name: 'lodash'}));

        const {stdout: version} = await childProcess.exec('npm show --json lodash version');
        expect(await fse.readJson(path.resolve(`project/jspm_packages/npm/lodash@${JSON.parse(version)}/package.json`)))
          .toEqual(jasmine.objectContaining({name: 'lodash'}));
      }, 60000);
    });

    afterEach(async () => {
      await fse.remove('project');
    });
  });
});
