var minijasminelib = require('../lib/index');

describe('syntax-error', function() {
  var env,
      apiReporter;
  beforeEach(function() {
    env = new jasmine.Env
    apiReporter = new jasmine.JsApiReporter({});
    env.addReporter(apiReporter);
    // Suppress messages from the nested minijasminelib call.
    env.addReporter = function() {};
  });

  it('should report a failure when a syntax error happens', function() {
    minijasminelib.executeSpecs({
      specs: ['spec/syntax_error.js'],
      jasmineEnv: env
    });

    expect(apiReporter.specs().length).toEqual(1);
    var firstResult = apiReporter.specs()[0];
    expect(firstResult.status).toEqual('failed');
    expect(firstResult.failedExpectations[0].message).toMatch('SyntaxError');
  });
});
