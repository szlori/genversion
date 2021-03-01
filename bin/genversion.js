#!/usr/bin/env node

const gv = require('../lib/genversion')
const cv = require('../lib/checkVersion')
const v = require('../lib/version')
const program = require('commander')
const path = require('path')

const increaseVerbosity = (verb, total) => {
  return total + 1
}

program
  .version(v)
  .usage('[options] <target>')
  .description('Generates a version module at the target filepath.')
  .option('-v, --verbose', 'output the new version', increaseVerbosity, 0)
  .option('-s, --semi', 'use semicolons in generated code')
  .option('-e, --es6', 'use es6 syntax in generated code')
  .option('-p, --source <path>', 'search for package.json along a custom path')
  .option('-c, --check-only', 'check if the version module is up to date')
  .action((target) => {
    if (typeof target !== 'string' || target === '') {
      console.error('Missing argument: target')
      return process.exit(1)
    }

    if (program.checkOnly) {
      return cv.check(target, {
        useSemicolon: program.semi,
        useEs6Syntax: program.es6,
        source: program.source
      }, (err, comparisonResult, version) => {
        if (err) {
          console.error(err.toString())
          return process.exit(1)
        }
        if (program.verbose >= 1) {
          switch (comparisonResult) {
            case 0:
              console.log('The version module ' + path.basename(target) +
                ' matches the content for version ' + version)
              break
            case 1:
              console.error('The version module ' + path.basename(target) +
                ' could not be found.')
              break
            case 2:
              console.error('The version module ' + path.basename(target) +
                ' doesn\'t match the expected content for version ' + version)
              break
            default:
              throw new Error('Unknown comparisonResult: ' + comparisonResult)
          }
        }
        return process.exit(comparisonResult)
      })
    }

    if (typeof program.source !== 'string' || program.source === '') {
      program.source = target
    }

    gv.check(target, (err, doesExist, isByGenversion) => {
      if (err) {
        console.error(err.toString())
        return process.exit(1)
      }

      if (doesExist) {
        if (isByGenversion) {
          gv.generate(target, {
            useSemicolon: program.semi,
            useEs6Syntax: program.es6,
            source: program.source
          }, (errg, version) => {
            if (errg) {
              console.error(errg)
              return
            }

            if (program.verbose >= 1) {
              console.log('Version module ' + path.basename(target) +
                ' was successfully updated to ' + version)
            }
          })
        } else {
          // FAIL, unknown file, do not replace
          console.error(
            'ERROR: File ' + target + ' is not generated by genversion and ' +
            'therefore will not be replaced. Please ensure that the file can ' +
            'be destroyed and remove it manually before retry.'
          )
        }
      } else {
        // OK, file does not exist.
        gv.generate(target, {
          useSemicolon: program.semi,
          useEs6Syntax: program.es6,
          source: program.source
        }, (errg, version) => {
          if (errg) {
            console.error(errg)
            return
          }

          if (program.verbose >= 1) {
            console.log('Version module ' + path.basename(target) +
              ' was successfully generated with version ' + version)
          }
        })
      }
    })
  })

program.on('--help', () => {
  // Additional newline.
  console.log('')
})

program.parse(process.argv)

if (program.args.length === 0) {
  console.error('ERROR: Missing argument <target>')
  program.outputHelp()
}
