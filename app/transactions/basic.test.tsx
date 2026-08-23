/**
 * Basic test to verify Jest is working with our setup
 */
describe('Basic Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
  
  it('should do simple math', () => {
    expect(2 + 2).toBe(4);
  });
});