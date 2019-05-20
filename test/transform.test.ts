import compile from "../compile";
import { resolve } from "path";
import { expect } from "chai";
import {readFileSync} from 'fs-extra'

describe("json transformer", function() {
  this.timeout(5000);
  describe('d.ts', function () {
    it("should handle import {subkey}", function() {
      compile(resolve(__dirname, "fixture/foo.ts"));
      expect(readFileSync(require.resolve('./fixture/foo.d.ts'), 'utf8')).to.equal(
`declare var test: number;
export declare function foo(): (string | {
    "typescript": string;
})[];
export declare function getTest(): number;
export declare type foo = typeof test;
export declare var version: string;
`)
    });
    it("should handle import *", function() {
      compile(resolve(__dirname, "fixture/all.ts"));
      expect(readFileSync(require.resolve('./fixture/all.d.ts'), 'utf8')).to.equal(
`declare var packageJson: {
    "name": string;
    "version": string;
    "description": string;
    "main": string;
    "scripts": {
        "test": string;
        "prettier": string;
        "prepublishOnly": string;
    };
    "repository": {
        "type": string;
        "url": string;
    };
    "keywords": [string, string, string, string, string];
    "author": string;
    "license": string;
    "bugs": {
        "url": string;
    };
    "homepage": string;
    "dependencies": {
        "typescript": string;
    };
    "devDependencies": {
        "@types/chai": string;
        "@types/fs-extra": string;
        "@types/glob": string;
        "@types/mocha": string;
        "@types/node": string;
        "chai": string;
        "fs-extra": string;
        "glob": string;
        "mocha": string;
        "pre-commit": string;
        "prettier": string;
        "ts-node": string;
    };
};
export declare function getAll(): {
    "name": string;
    "version": string;
    "description": string;
    "main": string;
    "scripts": {
        "test": string;
        "prettier": string;
        "prepublishOnly": string;
    };
    "repository": {
        "type": string;
        "url": string;
    };
    "keywords": string[];
    "author": string;
    "license": string;
    "bugs": {
        "url": string;
    };
    "homepage": string;
    "dependencies": {
        "typescript": string;
    };
    "devDependencies": {
        "@types/chai": string;
        "@types/fs-extra": string;
        "@types/glob": string;
        "@types/mocha": string;
        "@types/node": string;
        "chai": string;
        "fs-extra": string;
        "glob": string;
        "mocha": string;
        "pre-commit": string;
        "prettier": string;
        "ts-node": string;
    };
};
export declare type Package = typeof packageJson;
`)
    });
  })
  it("should handle import {subkey} & alias", function() {
    compile(resolve(__dirname, "fixture/foo.ts"));
    expect(readFileSync(require.resolve('./fixture/foo.js'), 'utf8')).to.contain('var version = "1.0.8", dependencies = { "typescript": "^3.4.5" }')
    expect(readFileSync(require.resolve('./fixture/foo.js'), 'utf8')).to.contain('LICENSE = "MIT"')
    expect(readFileSync(require.resolve('./fixture/foo.js'), 'utf8')).to.contain('var test = 1')
  });
  it("should handle import *", function() {
    compile(resolve(__dirname, "fixture/all.ts"));
    expect(readFileSync(require.resolve('./fixture/all.js'), 'utf8')).to.contain('var packageJson = { "name": "ts-transform-json",')
  });
  it('should handle re-export', function () {
    compile(resolve(__dirname, "fixture/foo.ts"));
    expect(readFileSync(require.resolve('./fixture/foo.js'), 'utf8')).to.contain('export var version = "1.0.8"')
  })
});
