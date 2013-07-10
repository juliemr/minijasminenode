var util = require('util'),
    path = require('path'),
    fs  = require('fs');

var minijasminelib = require('./index');
/**
 * A super simple wrapper around minijasminelib.executeSpecs()
 */

var forceExit = false;
var captureExceptions = false;

var onComplete = function(runner, log) {
  util.print('\n');
  if (runner.results().failedCount == 0) {
    exitCode = 0;
  } else {
    exitCode = 1;
  }
  if (forceExit) {
    process.exit(exitCode);
  }
};

var options = {
  tests: [],
  onComplete: onComplete,
  isVerbose: false,
  showColors: true,
  junitreport: {
    report: false,
    savePath: './reports/',
    useDotNotation: true,
    consolidate: true
  },
  includeStackTrace: true
};


var args = process.argv.slice(2);

while(args.length) {
  var arg = args.shift();

  switch(arg)
  {
    case '--color':
      options.showColors = true;
      break;
    case '--noColor':
    case '--nocolor':
      options.showColors = false;
      break;
    case '--verbose':
      options.isVerbose = true;
      break;
    case '--junitreport':
        options.junitreport.report = true;
        break;
    case '--junitoutput':
        options.junitreport.savePath = args.shift();
        break;
    case '--forceexit':
        forceExit = true;
        break;
    case '--captureExceptions':
        captureExceptions = true;
        break;
    case '--noStack':
        options.includeStackTrace = false;
        break;
    case '--config':
        var configKey = args.shift();
        var configValue = args.shift();
        process.env[configKey]=configValue;
        break;
    case '-h':
    case '--help':
        help();
    default:
      if (arg.match(/^--params=.*/)) {
        break;
      }
      if (arg.match(/^-/)) {
        help();
      }
      if (arg.match(/^\/.*/)) {
        options.tests.push(arg);
      } else {
        options.tests.push(path.join(process.cwd(), arg));
      }
      break;
  }
}

if (options.tests.length === 0) {
  help();
} else {
  // Check to see if all our files exist
  for (var i = 0; i < options.tests.length; i++) {
    if (!fs.existsSync(options.tests[i])) {
        console.log("File: " + options.tests[i] + " is missing.");
        return;
    }
  }
}

var exitCode = 0;

if (captureExceptions) {
  process.on('uncaughtException', function(e) {
    console.error(e.stack || e);
    exitCode = 1;
    process.exit(exitCode);
  });
}

function onExit() {
  process.removeListener("exit", onExit);
  process.exit(exitCode);
}
process.on("exit", onExit);

minijasminelib.executeSpecs(options);


function help(){
  util.print([
    'USAGE: jasmine-node [--color|--noColor] [--verbose] test1 test2'
  , ''
  , 'Options:'
  , '  --color            - use color coding for output'
  , '  --noColor          - do not use color coding for output'
  , '  --verbose          - print extra information per each test run'
  , '  --junitreport      - export tests results as junitreport xml format'
  , '  --junitoutput      - defines the output folder for junitreport files'
  , '  --forceexit        - force exit once tests complete'
  , '  --captureExceptions- listen to global exceptions, report them and exit (interferes with Domains)'
  , '  --noStack          - suppress the stack trace generated from a test failure'
  , '  -h, --help         - display this help and exit'
  , ''
  ].join("\n"));

  process.exit(-1);
}
