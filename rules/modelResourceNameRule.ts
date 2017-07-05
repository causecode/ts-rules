import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "Resource name and Model name must be same.";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>) {
    let fileName: string = ctx.sourceFile.fileName.match(/\/\w+Model\.(ts|tsx)/) ? ctx.sourceFile.fileName.match(/\/\w+Model\.(ts|tsx)/)[0] : '';
    if (fileName.indexOf('Model') === -1) {
        return;
    }
    let resource: string = fileName.substring(1,fileName.indexOf('Model')).toLowerCase();
    return ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.PropertyDeclaration && node.getFullText().indexOf('resourceName') !== -1) {
            let regex = new RegExp(/('|")\w+('|")/);
            let matchedString = node.getFullText().match(regex)[0]; 
            let resourceName: string = matchedString.substring(1,matchedString.length - 1).toLowerCase();
            if (resource !== resourceName) {
               return ctx.addFailureAt(node.getStart() + node.getFullText().trim().search(regex), resourceName.length, Rule.FAILURE_STRING); 
            }
        }
        return ts.forEachChild(node, cb);
    });
}