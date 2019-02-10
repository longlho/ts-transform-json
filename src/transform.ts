import * as ts from 'typescript'
function visitor (ctx: ts.TransformationContext, sf: ts.SourceFile) {
    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
        return ts.visitEachChild(node, visitor, ctx)
    }

    return visitor
}
export function transform (): ts.TransformerFactory<ts.SourceFile> {
    return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
        return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf))
    }
}