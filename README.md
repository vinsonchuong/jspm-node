# jspm-node
[![Build Status](https://travis-ci.org/vinsonchuong/jspm-node.svg?branch=master)](https://travis-ci.org/vinsonchuong/jspm-node)

Automatically installs the jspm version of each npm package dependency.

## Installing
`jspm-node` is available as an
[npm package](https://www.npmjs.com/package/jspm-node).

## Usage
In your `package.json`, run the `jspm-node` command from the `prepublish`
script as follows:

```json
{
  "name": "project",
  "scripts": {
    "prepublish": "jspm-node"
  }
}
```

Now, running `npm install` will install dependencies via npm as well as jspm.
Note that the `prepublish` script will only be run when not passing an argument
to `npm install`. So, only install packages by manually adding them to the
`package.json` and running `npm install` with no arguments.

## Development
### Getting Started
The application requires the following external dependencies:
* Node.js

The rest of the dependencies are handled through:
```bash
npm install
```

Run tests with:
```bash
npm test
```
