
// See https://www.npmjs.com/package/command-line-test
const CliTest = require('command-line-test');
const path = require('path');
const fs = require('fs-extra');
const should = require('should');
const firstline = require('firstline');
const pjson = require('../package');

// If global command is used, you must 'npm link' before tests.
//const COMMAND = 'genversion';  // Global
const COMMAND = 'bin/genversion.js';  // Local

const P = '.tmp/v.js';

const createInvalidTemp = function () {

};

const removeTemp = function () {
  if (fs.existsSync(P)) {
    fs.unlinkSync(P);
    fs.rmdirSync(path.dirname(P));
  }
};


describe('genversion cli', function () {

  beforeEach(function () {
    removeTemp();
  });

  afterEach(function () {
    removeTemp();
  });

  it('should generate file if it does not exist', function (done) {

    const clit = new CliTest();

    clit.exec(COMMAND + ' ' + P, function (err, response) {
      if (err) {
        console.error(err, response);
        return;
      }

      // Should not have any output
      response.stdout.should.equal('');
      response.stderr.should.equal('');

      fs.existsSync(P).should.be.True;

      return done();
    });
  });

  it('should not generate if unknown file exists', function (done) {

    // Generate file with unknown signature
    const INVALID_SIGNATURE = 'foobarcontent';
    fs.outputFileSync(P, INVALID_SIGNATURE);

    const clit = new CliTest();

    clit.exec(COMMAND + ' ' + P, function (err, response) {
      if (err) {
        console.error(err, response);
        return;
      }

      response.stderr.should.startWith('ERROR');

      // Ensure the file was not replaced
      firstline(P).then(function (line) {
        line.should.equal(INVALID_SIGNATURE);
        return done();
      }).catch(function (err) {
        return done(err);
      });
    });
  });

  it('should allow verbose flag', function (done) {
    const clit = new CliTest();

    clit.exec(COMMAND + ' -v ' + P, function (err, response) {
      if (err) {
        console.error(err, response);
        return;
      }

      response.stdout.should.containEql(pjson.version);

      return done();
    });
  });

  it('should detect missing target path', function (done) {
    const clit = new CliTest();

    clit.exec(COMMAND + ' -v', function (err, response) {
      if (err) {
        console.error(err, response);
        return;
      }

      response.stderr.should.not.equal('');

      return done();
    });
  });

  it('should show version', function (done) {
    const clit = new CliTest();

    clit.exec(COMMAND + ' --version', function (err, response) {
      if (err) {
        console.error(err);
        return;
      }

      response.stdout.should.equal(pjson.version);

      return done();
    });
  });
});
