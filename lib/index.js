var util = require('util');
var path = require('path');

var jasmineRequire = require('jasmine-core');
var TerminalReporter = require('./reporter.js').TerminalReporter;

global.jasmine = jasmineRequire.core(jasmineRequire);

var env = jasmine.getEnv();

var jasmineInterface = {
  describe: function(description, specDefinitions) {
    return jasmine.getEnv().describe(description, specDefinitions);
  },

  xdescribe: function(description, specDefinitions) {
    return jasmine.getEnv().xdescribe(description, specDefinitions);
  },

  fdescribe: function(description, specDefinitions) {
    return jasmine.getEnv().fdescribe(description, specDefinitions);
  },

  it: function(desc, func, timeout) {
    return jasmine.getEnv().it(desc, func, timeout);
  },

  xit: function(desc, func, timeout) {
    return jasmine.getEnv().xit(desc, func, timeout);
  },

  fit: function(desc, func, timeout) {
    return jasmine.getEnv().fit(desc, func, timeout);
  },

  beforeEach: function(beforeEachFunction, timeout) {
    return jasmine.getEnv().beforeEach(beforeEachFunction);
  },

  afterEach: function(afterEachFunction, timeout) {
    return jasmine.getEnv().afterEach(afterEachFunction);
  },

  beforeAll: function(beforeAllFunction, timeout) {
    return jasmine.getEnv().beforeAll(beforeAllFunction);
  },

  afterAll: function(afterAllFunction, timeout) {
    return jasmine.getEnv().afterAll(afterAllFunction);
  },

  expect: function(actual) {
    return jasmine.getEnv().expect(actual);
  },

  pending: function() {
    return jasmine.getEnv().pending();
  },

  fail: function(error) {
    return jasmine.getEnv().fail(error);
  },

  spyOn: function(obj, methodName) {
    return jasmine.getEnv().spyOn(obj, methodName);
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
  jasmine.getEnv().addCustomEqualityTester(tester);
};

/**
 * Expose the interface for adding custom expectation matchers
 */
jasmine.addMatchers = function(matchers) {
  return jasmine.getEnv().addMatchers(matchers);
};

/**
 * Expose the mock interface for the JavaScript timeout functions
 */
jasmine.clock = function() {
  return jasmine.getEnv().clock;
};

/*
 * Support 'it.only', 'oit' and 'iit', and equivalent describe focusing.
 */
describe.only = global.ddescribe = global.odescribe = global.fdescribe;
it.only = global.iit = global.oit = global.fit;

function removeJasmineFrames(text) {
  if (!text) {
    return text;
  }
  var jasmineFilename = path.join(
      __dirname,
      '../node_modules/jasmine-core/lib/jasmine-core/jasmine.js');
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
exports.addReporter = function(reporter) {
  jasmine.getEnv().addReporter(reporter);
};

/**
 * Execute the loaded specs. Optional options object described below.
 * @param {Object} options
 */
exports.executeSpecs = function(options) {
  options = options || {};
  var reporterOptions = {
    timer: new jasmine.Timer()
  };
  // Jasmine environment to use.
  var jasmineEnv = options['jasmineEnv'] || env;
  var originalGetEnv = jasmine.getEnv;
  jasmine.getEnv = function() {
    return jasmineEnv;
  }

  // An array of filenames, either absolute or relative to current working dir.
  // These will be executed, as well as any tests added with addSpecs()
  var specs = options['specs'] || [];
  // A function to call on completion. function([boolean passed])
  reporterOptions.done = function(passed) {
    jasmine.getEnv = originalGetEnv;
    if (options.onComplete) {
      options.onComplete(passed);
    }
  };
  // If true, display spec names
  reporterOptions.isVerbose = options['isVerbose'];
  // If true, print colors to the terminal
  reporterOptions.showColors = options['showColors'];
  // If true, include stack traces in failures
  reporterOptions.includeStackTrace = options['includeStackTrace'];
  // Time to wait in milliseconds before a test automatically fails
  var defaultTimeoutInterval = options['defaultTimeoutInterval'] || 5000;

  // Overrides the print function of the terminal reporters
  reporterOptions.print = options['print'] || process.stdout.write.bind(process.stdout);
  // Overrides the stack trace filter
  reporterOptions.stackFilter = options['stackFilter'] || removeJasmineFrames;



  var reporter = new TerminalReporter(reporterOptions);
  jasmine.getEnv().addReporter(reporter);

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

  jasmine.getEnv().execute();
};
