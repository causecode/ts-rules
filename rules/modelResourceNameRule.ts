import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING: string = "Resource name and Model name must be same.";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>) {
    // fileName will begin with / (e.g '/BlogModel.ts')
    let fileNameRegExpMatcher: RegExpMatchArray | null = ctx.sourceFile.fileName.match(/\/\w+Model\.(ts|tsx)/);
    let fileName: string = fileNameRegExpMatcher ? fileNameRegExpMatcher[0] : '';
    if (fileName.indexOf('Model') === -1) {
        return;
    }
    let resource: string = fileName.substring(1,fileName.indexOf('Model')).toLowerCase();

    return ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
        let nodeText: string = node.getFullText();
        if (node.kind === ts.SyntaxKind.PropertyDeclaration && nodeText.indexOf('resourceName') !== -1) {
            let regex: RegExp = new RegExp(/('|")\w+('|")/);
            let matchedString: string = nodeText.match(regex)[0]; 
            let resourceName: string = matchedString.substring(1,matchedString.length - 1).toLowerCase();
            if (resource !== resourceName) {
               return ctx.addFailureAt(node.getStart() + nodeText.trim().search(regex), resourceName.length, Rule.FAILURE_STRING); 
            }
        }

        return ts.forEachChild(node, cb);
    });
}