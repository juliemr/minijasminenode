var util = require('util');

/**
 * Based on Jasmine's ConsoleReporter.
 */

var simpleTimer = {
  started: 0,
  start: function() {
    this.started = new Date();
  },
  elapsed: function() {
    return new Date().getTime() - this.started.getTime();
  }
};

var simpleFilter = function(string) {
  return string;
};

exports.TerminalReporter = function(options) {
  var print = options.print,
    showColors = options.showColors || false,
    onComplete = options.onComplete || function() {},
    timer = options.timer || simpleTimer,
    includeStackTrace = options.includeStackTrace || false,
    stackFilter = options.stackFilter || simpleFilter,
    isVerbose = options.isVerbose || false,
    specCount,
    failureCount,
    failedSpecs = [],
    pendingCount,
    indentAmt = 0,
    ansi = {
      green: '\x1B[32m',
      red: '\x1B[31m',
      yellow: '\x1B[33m',
      none: '\x1B[0m'
    };

  this.jasmineStarted = function() {
    specCount = 0;
    failureCount = 0;
    pendingCount = 0;
    print("Started");
    printNewline();
    timer.start();
  };

  this.jasmineDone = function() {
    printNewline();
    for (var i = 0; i < failedSpecs.length; i++) {
      specFailureDetails(failedSpecs[i], i + 1);
    }

    printNewline();
    var specCounts = specCount + " " + plural("spec", specCount) + ", " +
      failureCount + " " + plural("failure", failureCount);

    if (pendingCount) {
      specCounts += ", " + pendingCount + " pending " + plural("spec", pendingCount);
    }

    if (failureCount > 0) {
      print(colored('red', specCounts));
    } else if (pendingCount) {
      print(colored('yellow', specCounts));
    } else {
      print(colored('green', specCounts));
    }


    printNewline();
    var seconds = timer.elapsed() / 1000;
    print("Finished in " + seconds + " " + plural("second", seconds));

    printNewline();

    onComplete(failedSpecs);
  };

  this.suiteStarted = function(info) {
    if (isVerbose) {
      print(indent(info.description, indentAmt));
      printNewline();
    }
    indentAmt += 2;
  }

  this.suiteDone = function() {
    indentAmt -= 2;
  };

  this.specDone = function(result) {
    specCount++;

    // util.print(util.inspect(result));

    if (result.status == "pending") {
      var msg = isVerbose ? indent(result.description, indentAmt) + '\n': '*';
      print(colored("yellow", msg));
      return;
    }

    if (result.status == "passed") {
      var msg = isVerbose ? indent(result.description, indentAmt) + '\n' : '.';
      print(colored("green", msg));
      return;
    }

    if (result.status == "failed") {
      failureCount++;
      failedSpecs.push(result);
      var msg = isVerbose ? indent(result.description, indentAmt) + '\n' : 'F';
      print(colored("red", msg));
    }
  };

  return this;

  function printNewline() {
    print("\n");
  }

  function colored(color, str) {
    return showColors ? (ansi[color] + str + ansi.none) : str;
  }

  function plural(str, count) {
    return count == 1 ? str : str + "s";
  }

  function repeat(thing, times) {
    var arr = [];
    for (var i = 0; i < times; i++) {
      arr.push(thing);
    }
    return arr;
  }

  function indent(str, spaces) {
    var lines = (str || '').split("\n");
    var newArr = [];
    for (var i = 0; i < lines.length; i++) {
      newArr.push(repeat(" ", spaces).join("") + lines[i]);
    }
    return newArr.join("\n");
  }

  function specFailureDetails(result, index) {
    printNewline();
    print(index + ') ' + result.fullName);

    for (var i = 0; i < result.failedExpectations.length; i++) {
      var failedExpectation = result.failedExpectations[i];
      printNewline();
      print(indent(colored('red', failedExpectation.message), 2));
      if (includeStackTrace) {
        printNewline();
        print(indent(stackFilter(failedExpectation.stack), 2));
      }
    }

    printNewline();
  }
}
