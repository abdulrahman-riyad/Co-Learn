// Path: co-learn/apis/tests/simple-test.spec.ts
// Role: Simple test to verify Mocha + TypeScript setup is working
// Run this first to check if your testing environment is configured correctly

import 'mocha';
import { expect } from 'chai';

describe('🧪 Simple Test Suite', function() {
  
  it('should pass a basic test', function() {
    expect(true).to.be.true;
    expect(1 + 1).to.equal(2);
  });

  it('should work with async/await', async function() {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).to.equal('test');
  });

  it('should work with arrays', function() {
    const arr = [1, 2, 3];
    expect(arr).to.be.an('array');
    expect(arr).to.have.lengthOf(3);
    expect(arr).to.include(2);
  });

  it('should work with objects', function() {
    const obj = { name: 'test', value: 123 };
    expect(obj).to.have.property('name', 'test');
    expect(obj).to.have.property('value', 123);
  });
});