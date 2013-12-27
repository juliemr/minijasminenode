describe('mini-jasmine-node', function() {
  it('should pass', function() {
    expect(1 + 2).toEqual(3);
  });

  it('shows asynchronous test node-style', function(done) {
    setTimeout(function() {
      expect('second').toEqual('second');
      done();
    }, 1);
    expect('first').toEqual('first');
  });
});
