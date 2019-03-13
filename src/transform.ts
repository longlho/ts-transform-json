import * as ts from 'typescript'
import {resolve, dirname} from 'path'


type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONObject {
    [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> { }

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
                keys.map(k => 
                    ts.createPropertyAssignment(
                        ts.createStringLiteral(k), 
                        serializeToAst(v[k])
                    )
                )
            )
    }
}

function trimQuote (path: string) {
    return path.slice(1, path.length - 1)
}

function resolveJsonImport (path: string): string {
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

function visitor (ctx: ts.TransformationContext, sf: ts.SourceFile) {
    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
        let jsonPath: string
        if (ts.isImportDeclaration(node) && (jsonPath = trimQuote(node.moduleSpecifier.getText(sf)))) {
            const fullJsonPath = resolveJsonImport(resolve(dirname(sf.fileName), jsonPath))
            const json = require(fullJsonPath)
            // Default import, inline the whole json
            // and convert it to const foo = {json}
            let value: ts.VariableDeclarationList
            if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                value = ts.createVariableDeclarationList([
                    ts.createVariableDeclaration(
                        node.importClause.namedBindings.name.getText(sf),
                        undefined,
                        serializeToAst(json)
                    )
                ])
            } else if (ts.isNamedImports(node.importClause.namedBindings)) {
                const keys = node.importClause.namedBindings.elements.map(el => el.name.getText(sf))
                value = ts.createVariableDeclarationList(keys.map(k => ts.createVariableDeclaration(k, undefined, serializeToAst(json[k]))))
            }
            return ts.createVariableStatement(
                [ts.createModifier(ts.SyntaxKind.ConstKeyword)], 
                value
            )
        }
        return ts.visitEachChild(node, visitor, ctx)
    }

    return visitor
}
export function transform (): ts.TransformerFactory<ts.SourceFile> {
    return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
        return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf))
    }
}