import * as ts from 'typescript'
import { resolve, dirname } from 'path'

type JSONValue = string | number | boolean | JSONObject | JSONArray

interface JSONObject {
    [x: string]: JSONValue
}

interface JSONArray extends Array<JSONValue> {}

function serializeToAst(v: JSONValue): ts.Expression {
    if (Array.isArray(v)) {
        return ts.createArrayLiteral(v.map(el => serializeToAst(el)))
    }
    switch (typeof v) {
        case 'string':
            return ts.createStringLiteral(v)
        case 'number':
            return ts.createNumericLiteral(String(v))
        case 'boolean':
            return v ? ts.createTrue() : ts.createFalse()
        case 'object':
            if (!v) {
                return ts.createNull()
            }
            const keys = Object.keys(v)
            return ts.createObjectLiteral(
                keys.map(k => ts.createPropertyAssignment(ts.createStringLiteral(k), serializeToAst(v[k])))
            )
    }
}

function serializeToTypeAst(v: JSONValue): ts.TypeNode {
    if (Array.isArray(v)) {
        return ts.createTupleTypeNode(v.map(el => serializeToTypeAst(el)))
    }
    switch (typeof v) {
        case 'string':
            return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        case 'number':
            return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
        case 'boolean':
            return v ? ts.createTrue() : ts.createFalse()
        case 'object':
            if (!v) {
                return ts.createNull()
            }
            const keys = Object.keys(v)
            return ts.createTypeLiteralNode(
                keys.map(k =>
                    ts.createPropertySignature(
                        undefined,
                        ts.createStringLiteral(k),
                        undefined,
                        serializeToTypeAst(v[k]),
                        undefined
                    )
                )
            )
    }
}

function trimQuote(path: string) {
    return path.slice(1, path.length - 1)
}

function resolveJsonImport(path: string): string {
    if (path.endsWith('.json')) {
        return path
    }
    try {
        path = require.resolve(path + '.json')
    } catch (_) {
        return ''
    }
    return path
}

function resolveJsonImportFromNode(node: ts.ImportDeclaration, sf: ts.SourceFile): string {
    const jsonPath = trimQuote(node.moduleSpecifier.getText(sf))
    return jsonPath && resolveJsonImport(resolve(dirname(sf.fileName), jsonPath))
}

export interface Opts {
    isDeclaration?: boolean
}

function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
        let jsonPath: string
        if (ts.isImportDeclaration(node) && (jsonPath = resolveJsonImportFromNode(node, sf))) {
            const json = require(jsonPath)
            // Default import, inline the whole json
            // and convert it to const foo = {json}
            let value: ts.VariableDeclarationList
            if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                value = ts.createVariableDeclarationList([
                    ts.createVariableDeclaration(
                        node.importClause.namedBindings.name.getText(sf),
                        undefined,
                        serializeToAst(json)
                    ),
                ])
            } else if (ts.isNamedImports(node.importClause.namedBindings)) {
                const keys = node.importClause.namedBindings.elements.map(el => el.name.getText(sf))
                value = ts.createVariableDeclarationList(
                    keys.map(k => ts.createVariableDeclaration(k, undefined, serializeToAst(json[k])))
                )
            }
            return ts.createVariableStatement([ts.createModifier(ts.SyntaxKind.ConstKeyword)], value)
        }
        return ts.visitEachChild(node, visitor, ctx)
    }

    return visitor
}

function dtsVisitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
        let jsonPath: string
        if (ts.isImportDeclaration(node) && (jsonPath = resolveJsonImportFromNode(node, sf))) {
            const json = require(jsonPath)
            // Default import, inline the whole json
            // and convert it to const foo = {json}
            if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                return ts.createVariableStatement(
                    [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
                    ts.createVariableDeclarationList([
                        ts.createVariableDeclaration(
                            node.importClause.namedBindings.name.getText(sf),
                            serializeToTypeAst(json)
                        ),
                    ])
                )
            } else if (ts.isNamedImports(node.importClause.namedBindings)) {
                const keys = node.importClause.namedBindings.elements.map(el => el.name.getText(sf))
                return ts.createVariableStatement(
                    [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
                    ts.createVariableDeclarationList(
                        keys.map(k => ts.createVariableDeclaration(k, serializeToTypeAst(json[k])))
                    )
                )
            }
        }
        return ts.visitEachChild(node, visitor, ctx)
    }

    return visitor
}

export function transform(opts: Opts): ts.TransformerFactory<ts.SourceFile> {
    return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
        return (sf: ts.SourceFile) => ts.visitNode(sf, opts.isDeclaration ? dtsVisitor(ctx, sf) : visitor(ctx, sf))
    }
}
