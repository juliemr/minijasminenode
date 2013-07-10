describe('jasmine-node-uber-nested', function(){
  it('should pass', function(){
    expect(1+2).toEqual(3);
  });

  describe('failure', function(){
    it('should report failure (THIS IS EXPECTED)', function(){
      expect(true).toBeFalsy();
    });
  });
});

describe('Testing waitsfor functionality', function() {
    it('runs and then waitsFor should timeout (THIS IS EXPECTED)', function() {
        runs(function() {
            1+1;
        });
        waitsFor(function() {
            return true === false;
        }, 'the impossible', 1000);
        runs(function() {
            expect(true).toBeTruthy();
        });
    });
});
