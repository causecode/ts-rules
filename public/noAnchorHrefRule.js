"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new NoAnchorHref(sourceFile, this.getOptions()));
    }
}
Rule.FAILURE_STRING = 'Use React Router Link.';
exports.Rule = Rule;
class NoAnchorHref extends Lint.RuleWalker {
    visitJsxElement(node) {
        const regex = new RegExp(/^<a.*href.*/);
        const that = this;
        ts.forEachChild(node, function cb(child) {
            if (child.kind === ts.SyntaxKind.JsxOpeningElement) {
                if (regex.test(child.getFullText())) {
                    const hrefNode = child.getChildAt(2).getChildAt(0).getChildAt(2);
                    const url = hrefNode.getFullText().substring(1);
                    if (hrefNode.kind === ts.SyntaxKind.StringLiteral && !isExternalUrl(url)) {
                        return that.addFailureAt(child.getStart(), child.getWidth(), Rule.FAILURE_STRING);
                    }
                }
            }
            return ts.forEachChild(child, cb);
        });
    }
}
const isExternalUrl = (url) => {
    const externalUrlPatterns = ['http://', '//', 'www', 'mailto', 'https://'];
    if (url.indexOf('.') > -1 || !!externalUrlPatterns.filter((pattern) => url.startsWith(pattern)).length) {
        return true;
    }
    return false;
};
