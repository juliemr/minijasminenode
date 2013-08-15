describe("Top level describe block", function() {
  iit("first it block in top level describe", function() {
    expect(true).toEqual(true);
  });
  describe("Second level describe block", function() {
    iit("first it block in second level describe", function() {
      expect(true).toBe(true);
    });
  });
  it("second it block in top level describe", function() {
    expect(true).toEqual(true);
  });
});
