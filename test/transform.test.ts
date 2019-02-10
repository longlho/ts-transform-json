import compile from "../compile";
import { resolve } from "path";
import { expect } from "chai";

describe("import path rewrite should work", function() {
  this.timeout(5000);
  beforeEach(function() {
    compile(resolve(__dirname, "fixture/foo.ts"));
  });
  it("in js output", function() {
    const output = require('./fixture/foo.js')
    expect(output.foo()).to.equal([])
    expect(output.getAll()).to.equal(require('../package.json'))
  });
});
