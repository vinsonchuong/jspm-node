import path from 'path';
import {childProcess} from 'node-promise-es6';
import {fs} from 'node-promise-es6';
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
          prepublish: '../node_modules/.bin/jspm-node'
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

      it('puts config.js inside of jspm_packages', async () => {
        expect(await fs.readdir(path.resolve('project')))
          .not.toContain('config.js');
        expect(await fs.readdir(path.resolve('project/jspm_packages')))
          .toContain('config.js');
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

    it('can install jspm packages from both GitHub and npm', async () => {
      await updateJson('project/package.json', {
        dependencies: {
          lodash: '*',
          d3: '*'
        }
      });
      await childProcess.exec('npm install', {cwd: 'project'});

      const {stdout: lodashVersion} = await childProcess.exec('npm show --json lodash version');
      expect(await fse.readJson(path.resolve(`project/jspm_packages/npm/lodash@${JSON.parse(lodashVersion)}/package.json`)))
        .toEqual(jasmine.objectContaining({name: 'lodash'}));

      const {stdout: d3Version} = await childProcess.exec('npm show --json d3 version');
      expect(await fs.readFile(path.resolve(`project/jspm_packages/github/mbostock/d3@${JSON.parse(d3Version)}.js`)))
        .toMatch(/module\.exports/);
    }, 60000);

    afterEach(async () => {
      await fse.remove('project');
    });
  });
});
