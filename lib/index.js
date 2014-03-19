var util = require('util');
var path = require('path');

// Put jasmine in the global context, this is somewhat like running in a
// browser where every file will have access to `jasmine`.
// This is adapted from Jasmine's 'boot.js'.
var jasmineRequire = require('jasmine-core');
var TerminalReporter = require('./jasmine-console.js').TerminalReporter;

global.jasmine = jasmineRequire.core(jasmineRequire);

var env = jasmine.getEnv();

var jasmineInterface = {
  describe: function(description, specDefinitions) {
    return env.describe(description, specDefinitions);
  },

  xdescribe: function(description, specDefinitions) {
    return env.xdescribe(description, specDefinitions);
  },

  it: function(desc, func) {
    return env.it(desc, func);
  },

  xit: function(desc, func) {
    return env.xit(desc, func);
  },

  beforeEach: function(beforeEachFunction) {
    return env.beforeEach(beforeEachFunction);
  },

  afterEach: function(afterEachFunction) {
    return env.afterEach(afterEachFunction);
  },

  expect: function(actual) {
    return env.expect(actual);
  },

  pending: function() {
    return env.pending();
  },

  spyOn: function(obj, methodName) {
    return env.spyOn(obj, methodName);
  },

  jsApiReporter: new jasmine.JsApiReporter({
    timer: new jasmine.Timer()
  })
};

/**
 * Add all of the Jasmine global/public interface to the proper global, so a
 * project can use the public interface directly. For example, calling
 * `describe` in specs instead of `jasmine.getEnv().describe`.
 */
function extend(destination, source) {
  for (var property in source) destination[property] = source[property];
  return destination;
}
extend(global, jasmineInterface);

/**
 * Expose the interface for adding custom equality testers.
 */
jasmine.addCustomEqualityTester = function(tester) {
  env.addCustomEqualityTester(tester);
};

/**
 * Expose the interface for adding custom expectation matchers
 */
jasmine.addMatchers = function(matchers) {
  return env.addMatchers(matchers);
};

/**
 * Expose the mock interface for the JavaScript timeout functions
 */
jasmine.clock = function() {
  return env.clock;
};

/*
 * Support 'it.only', 'fit', 'oit' and 'iit', and equivalent describe focusing.
 * Focused specs trump focused suites.
 */
var focusedSuites = [],
    focusedSpecs = [];
var focusedSuite = function(description, specDefinitions) {
  var suite = env.describe(description, specDefinitions);

  focusedSuites.push(suite.id);
  return suite;
};

var focusedSpec = function(description, func) {
  var spec = env.it(description, func);
  focusedSpecs.push(spec.id);

  return spec;
};

describe.only = global.fdescribe = global.ddescribe = global.odescribe = focusedSuite;
it.only = global.fit = global.iit = global.oit = focusedSpec;

var executionFilter = function(specsToRun) {
  if (focusedSpecs.length) {
    return focusedSpecs;
  } else if (focusedSuites.length) {
    return focusedSuites;
  } else {
    return specsToRun;
  }
};

function removeJasmineFrames(text) {
  if (!text) {
    return text;
  }
  var jasmineFilename = __dirname + '/jasmine-2.0.0.js';
  var lines = [];
  text.split(/\n/).forEach(function(line){
    if (line.indexOf(jasmineFilename) == -1) {
      lines.push(line);
    }
  });
  return lines.join('\n');
}

var specFiles = [];

/**
 * Add a spec file to the list to be executed. Specs should be relative
 * to the current working dir of the process or absolute.
 * @param {string|Array.<string>} specs
 */
exports.addSpecs = function(specs) {
  if (typeof specs === 'string') {
    specFiles.push(specs);
  } else if (specs.length) {
    for (var i = 0; i < specs.length; ++i) {
      specFiles.push(specs[i]);
    }
  }
};

/**
 * Alias for jasmine.getEnv().addReporter
 */
exports.addReporter = env.addReporter;

/**
 * Execute the loaded specs. Optional options object described below.
 * @param {Object} options
 */
exports.executeSpecs = function(options) {
  options = options || {};
  // An array of filenames, either absolute or relative to current working dir.
  // These will be executed, as well as any tests added with addSpecs()
  var specs = options['specs'] || [];
  // A function to call on completion. function(failedSpecArray)
  var done = options['onComplete'];
  // If true, display spec names 
  var isVerbose = options['isVerbose'];
  // If true, print colors to the terminal 
  var showColors = options['showColors'];
  // If true, include stack traces in failures 
  var includeStackTrace = options['includeStackTrace'];
  // Time to wait in milliseconds before a test automatically fails
  var defaultTimeoutInterval = options['defaultTimeoutInterval'] || 5000;
  // Jasmine environment to use.
  var jasmineEnv = options['jasmineEnv'] || env;
  // Overrides the print function of the terminal reporters
  var print = options['print'] || util.print;
  // Overrides the stack trace filter
  var stackFilter = options['stackFilter'] || removeJasmineFrames;

  var reporter = new TerminalReporter({
    print: print,
    showColors: showColors,
    onComplete: done,
    includeStackTrace: includeStackTrace,
    stackFilter: stackFilter,
    isVerbose: isVerbose
  });
  jasmineEnv.addReporter(reporter);

  jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeoutInterval;

  specFiles = specFiles.concat(specs);

  for (var i = 0, len = specFiles.length; i < len; ++i) {
    var filename = specFiles[i];
    // Catch exceptions in loading the spec files, and make them jasmine test
    // failures.
    try {
      require(path.resolve(process.cwd(), filename));
    } catch (e) {
      // Generate a synthetic suite with a failure spec, so that the failure is
      // reported with other results.
      jasmineEnv.describe('Exception loading: ' + filename, function() {
        jasmineEnv.it('Error', function() { throw e; });
      });
    }
  }

  var runnablesToRun = executionFilter([jasmineEnv.topSuite().id]);
  jasmineEnv.execute(runnablesToRun);
};
