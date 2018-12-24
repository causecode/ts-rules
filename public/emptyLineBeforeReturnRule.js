"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new EmptyLineBeforeReturn(sourceFile, this.getOptions()));
    }
}
Rule.FAILURE_STRING = 'Missing empty line before return.';
exports.Rule = Rule;
class EmptyLineBeforeReturn extends Lint.RuleWalker {
    constructor() {
        super(...arguments);
        this.getLineAndCharacter = (position) => {
            return ts.getLineAndCharacterOfPosition(this.getSourceFile(), position);
        };
    }
    visitReturnStatement(node) {
        const nodeText = node.getFullText();
        const parentLineStart = this.getLineAndCharacter(node.parent.getStart());
        const parentLineEnd = this.getLineAndCharacter(node.parent.getEnd());
        const lineStart = this.getLineAndCharacter(node.getStart());
        const lineEnd = this.getLineAndCharacter(node.getEnd());
        const noOfLines = lineEnd.line - lineStart.line;
        const newLines = nodeText.split(/[\n]/g).length;
        if ((newLines < noOfLines + 3) && (parentLineEnd.line - parentLineStart.line - newLines > 1)) {
            this.addFailureAt(node.getStart(), 6, Rule.FAILURE_STRING);
        }
        super.visitReturnStatement(node);
    }
}
