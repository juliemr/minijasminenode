var fs = require('fs');
var mkdirp = require('mkdirp');
var util = require('util');
var path = require('path');

// Put jasmine in the global context, this is somewhat like running in a
// browser where every file will have access to `jasmine`.
var requireJasmine = require('./jasmine-1.3.1.js');
for (var key in requireJasmine) {
  global[key] = requireJasmine[key];
}

// Allow async tests by passing in a 'done' function.
require('./async-callback');

// For jasmine.JUnitXmlReporter.
require('jasmine-reporters');

// For the terminal reporters.
var nodeReporters = require('./reporter').jasmineNode;
jasmine.TerminalVerboseReporter = nodeReporters.TerminalVerboseReporter;
jasmine.TerminalReporter = nodeReporters.TerminalReporter;

function removeJasmineFrames(text) {
  if (!text) {
    return text;
  }
  var jasmineFilename = __dirname + '/jasmine-1.3.1.js';
  var lines = [];
  text.split(/\n/).forEach(function(line){
    if (line.indexOf(jasmineFilename) == -1) {
      lines.push(line);
    }
  });
  return lines.join('\n');
}

exports.executeSpecs = function(options) {
  /** An array of filenames, relative to current dir */
  var tests = options['tests'];
  /** A function to call on completion. function(runner, log) */
  var done = options['onComplete'];
  /** If true, display spec names */
  var isVerbose = options['isVerbose'];
  /** If true, print colors to the terminal */
  var showColors = options['showColors'];
  /** 
   * If junitreport.report == true, print a JUnit style XML report
   * to junitreport.savePath.
   */
  var junitreport = options['junitreport'];
  /** If true, include stack traces in failures */
  var includeStackTrace = options['includeStackTrace'];

  // Overwriting it allows us to handle custom async specs
  it = function(desc, func, timeout) {
      return jasmine.getEnv().it(desc, func, timeout);
  }
  var colors = showColors || false,
      jasmineEnv = jasmine.getEnv();

  if (junitreport && junitreport.report) {
    var existsSync = fs.existsSync || path.existsSync;
    if (!existsSync(junitreport.savePath)) {
      util.puts('creating junit xml report save path: ' + junitreport.savePath);
      mkdirp.sync(junitreport.savePath, "0755");
    }
    jasmineEnv.addReporter(new jasmine.JUnitXmlReporter(
        junitreport.savePath,
        junitreport.consolidate,
        junitreport.useDotNotation));
  }

  if (isVerbose) {
    jasmineEnv.addReporter(new jasmine.TerminalVerboseReporter({
      print:       util.print,
      color:       showColors,
      onComplete:  done,
      stackFilter: removeJasmineFrames}));
  } else {
    jasmineEnv.addReporter(new jasmine.TerminalReporter({
      print:       util.print,
      color: showColors,
      includeStackTrace: includeStackTrace,
      onComplete:  done,
      stackFilter: removeJasmineFrames}));
  }

  var specFiles = tests; // TODO(julie) This should accept patterns.

  for (var i = 0, len = specFiles.length; i < len; ++i) {
    var filename = specFiles[i];
    // Catch exceptions in loading the spec files.
    try {
      require(filename);
    } catch (e) {
      console.log("Exception loading: " + filename);
      console.log(e);
    }
  }

  jasmineEnv.execute();
};
