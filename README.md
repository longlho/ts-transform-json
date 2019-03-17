# ts-transform-json

![build status](https://travis-ci.org/longlho/ts-transform-json.svg?branch=master)

Inline specific values from a JSON file or the whole JSON blob

## Usage

First of all, you need some level of familiarity with the [TypeScript Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API).

`compile.ts` & tests should have examples of how this works. The available options are:

### isDeclaration?: boolean
Whether you're running this transformer in declaration files (typically specified in `afterDeclarations` instead of `after` in transformer list). This flag will inline types
instead of actual value.
