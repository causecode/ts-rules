import * as console from 'console';
import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING: string = 'Use React Router Link.';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoAnchorHref(sourceFile, this.getOptions()));
    }
}

/**
 * This class creates rule which checks for anchor having external or internal url and
 * warns if anchor is used with internal url.
 * 
 * @author Mahesh Bhuva
 * @since v0.0.1
 * 
 * @class NoAnchorHref
 * @extends {Lint.RuleWalker}
 */
class NoAnchorHref extends Lint.RuleWalker {
    public visitJsxElement(node: ts.JsxElement) {
        const regex: RegExp = new RegExp(/^<a.*href.*/);
        const that = this;

        ts.forEachChild<void>(node, function cb(child: ts.Node): void {
            if (child.kind === ts.SyntaxKind.JsxOpeningElement) {
                if (regex.test(child.getFullText())) {
                    // This node contains the value of href
                    const hrefNode: ts.Node = child.getChildAt(2).getChildAt(0).getChildAt(2);
                    const url: string = hrefNode.getFullText().substring(1);

                    if (hrefNode.kind === ts.SyntaxKind.StringLiteral && !isExternalUrl(url)) {
                        return that.addFailureAt(child.getStart() , child.getWidth(), Rule.FAILURE_STRING);
                    }
                }
            }

            return ts.forEachChild(child, cb);
        });
    }
}

const isExternalUrl = (url: string): boolean => {
    const externalUrlPatterns: string[] = ['http://', '//', 'www', 'mailto', 'https://'];

    if (url.indexOf('.') > -1 || !!externalUrlPatterns.filter((pattern: string) => url.startsWith(pattern)).length) {
        return true;
    }

    return false;
};
