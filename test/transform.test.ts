import compile from "../compile";
import { resolve } from "path";
import { expect } from "chai";
import {readFileSync} from 'fs-extra'

describe("json transformer", function() {
  this.timeout(5000);
  it("should handle import {subkey}", function() {
    compile(resolve(__dirname, "fixture/foo.ts"));
    expect(readFileSync(require.resolve('./fixture/foo.js'), 'utf8')).to.contain('var version = "1.0.0", dependencies = { "typescript": "3" }')
  });
  it("should handle import *", function() {
    compile(resolve(__dirname, "fixture/all.ts"));
    expect(readFileSync(require.resolve('./fixture/all.js'), 'utf8')).to.contain('var packageJson = { "name": "ts-transform-json",')
  });
});
