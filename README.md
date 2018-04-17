# genversion

[![npm version](https://badge.fury.io/js/genversion.svg)](https://www.npmjs.com/package/genversion)

![Logo](doc/logo.png?raw=true "Abracadabra...and behold!")

So you want `yourmodule.version` to follow the version in package.json but are tired of updating it manually every time the version changes? You could import your package.json into the module but you know it is a **naughty** thing to do! Genversion to the rescue!

## Try it out

Usage is simple:

    $ cd yourmodule
    $ npm install -g genversion
    $ genversion lib/version.js

Voilà! The new lib/version.js:

    module.exports = '1.2.3'

Use flags to match your coding style. `$ genversion --es6 --semi lib/version.js` creates:

    export const version = '1.2.3';

## Integrate to your build

First install via [npm](https://www.npmjs.com/package/genversion).

    $ npm install genversion --save-dev

Genversion works by first reading the current version from package.json and then generating a simple CommonJS module file that exports the version string. For safety, the version file begins with a signature that tells genversion that the file can be overwritten.

    // generated by genversion
    module.exports = '1.2.3'

Now, your job is to 1) choose a path for the version file, 2) require() the new file into your module, and 3) add genversion as a part of your build or release pipeline. For example, let us choose the path 'lib/version.js' and require it in yourmodule/index.js:

    ...
    exports.version = require('./lib/version')
    ...

If you use `--es6` flag:

    ...
    import { version } from './lib/version'
    export const version
    ...

Then, let us integrate genversion into your build task.

    "scripts": {
      "build": "genversion lib/version.js && other build stuff"
    }

The target path is given as the first argument. If the file already exists and has been previously created by genversion, it is replaced with the new one.

Finished! Now your module has a version property that matches with package.json and is updated every time you build the project.

    > var yourmodule = require('yourmodule')
    > yourmodule.version
    '1.2.3'

Great! Having a version property in your module is very convenient for debugging. More than once we have needed to painstakingly debug a module, just to find out that it was a cached old version that caused the error. An inspectable version property would have helped a big time.


## Command line API

Directly from `$ genversion --help`:

    Usage: genversion [options] <target>

    Generates a version module at the target filepath.


    Options:

      -V, --version  output the version number
      -v, --verbose  output the new version
      -s, --semi     use semicolons in generated code
      -e, --es6      use es6 syntax in generated code
      -h, --help     output usage information


## Node API

You can also use genversion within your code:

    var gv = require('genversion');

The available properties and functions are listed below.


### genversion.check(targetPath, callback)

Check if it is possible to generate the version module into targetPath.

**Parameters:**

- *targetPath:* string. An absolute or relative file path. Relative to `process.cwd()`.
- *callback:* function (err, doesExist, isByGenversion). Parameter *doesExist* is a boolean that is true if a file at targetPath already exists. Parameter *isByGenversion* is a boolean that is true if the existing file seems like it has been generated by genversion.

**Example:**

    gv.check('lib/version.js', function (err, doesExist, isByGenversion) {
      if (err) {
        throw err;
      }

      if (isByGenversion) {
        gv.generate(...)
      }
      ...
    });


### genversion.generate(targetPath, opts, callback)

Read the version from the nearest package.json along the targetPath and generate a version module into targetPath.

**Parameters:**

- *targetPath:* string. An absolute or relative file path. Relative to `process.cwd()`.
- *opts:* optional options. Available keys are:
  - *useSemicolon:* optional boolean.
- *callback:* function (err, version). Parameter *version* is the version string read from package.json. Parameter *err* is non-null if package.json cannot be found, its version is not a string, or writing the module fails.

**Examples:**

    gv.generate('lib/version.js', function (err, version) {
      if (err) {
        throw err;
      }
      console.log('Sliding into', version, 'like a sledge.');
    });

    gv.generate('src/v.js', { useSemicolon: true }, function (err) {
      if (err) { throw err }
      console.log('Generated version file with a semicolon.')
    })



### genversion.version

The version string of genversion module in [semantic versioning](http://semver.org/) format. Generated with genversion itself, of course.


## Projects using genversion

- [genversion](https://www.npmjs.com/package/genversion)
- [poisson-process](https://www.npmjs.com/package/poisson-process)
- [taaspace](https://www.npmjs.com/package/taaspace)
- [taach](https://www.npmjs.com/package/taach)


## Related projects

- [versiony](https://github.com/ciena-blueplanet/versiony) for version increments
- [package-json-versionify](https://github.com/nolanlawson/package-json-versionify) for browserify builds


## For developers

Run test suite:

    $ npm run test

To make release, bump the version in package.json and run:

    $ npm run release


## License

[MIT](LICENSE)
