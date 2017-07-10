import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING: string = "Avoid using href with anchor when navigating within the application.";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoAnchorHref(sourceFile, this.getOptions()));
    }
}

class NoAnchorHref extends Lint.RuleWalker {
    public visitJsxElement(node: ts.JsxElement) {
        let regex: RegExp = new RegExp(/href.*/);
        let that = this;

        ts.forEachChild<void>(node, function cb(child: ts.Node): void {
            if (child.kind === ts.SyntaxKind.JsxOpeningElement) {
                if(regex.test(child.getFullText())) {
                    let pos: number = child.getFullText().trim().search(regex);
                    return that.addFailureAt(child.getStart() + pos, child.getWidth(), Rule.FAILURE_STRING);
                }
            }

            return ts.forEachChild(child, cb);
        });
    }
}