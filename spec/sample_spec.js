describe('mini-jasmine-node', function() {

  it('should pass', function() {
    expect(1 + 2).toEqual(3);
  });

  it('shows asynchronous test node-style', function(done) {
    setTimeout(function() {
      expect('second').toEqual('second');
      // If you call done.fail(), it will fail the spec
      // so you can use it as a handler for many async node calls
      done();
    }, 10);
    expect('first').toEqual('first');
  });
});
