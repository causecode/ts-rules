"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new NoImportSpace(sourceFile, this.getOptions()));
    }
}
Rule.FAILURE_STRING = 'Remove space in import statement';
exports.Rule = Rule;
class NoImportSpace extends Lint.RuleWalker {
    visitImportDeclaration(node) {
        const importValues = node.getChildAt(1);
        const importText = importValues.getFullText().trim();
        const startRegex = new RegExp(/^{\s+/);
        const endRegex = new RegExp(/\s+}$/);
        const lineStart = ts.getLineAndCharacterOfPosition(this.getSourceFile(), node.getStart());
        const lineEnd = ts.getLineAndCharacterOfPosition(this.getSourceFile(), node.getEnd());
        if (startRegex.test(importText) && lineEnd.line - lineStart.line === 0) {
            const spacesLength = importText.match(startRegex)[0].length;
            this.addFailureAt(importValues.getStart() + 1, spacesLength - 1, Rule.FAILURE_STRING);
        }
        if (endRegex.test(importText) && lineEnd.line - lineStart.line === 0) {
            const spacesLength = importText.match(endRegex)[0].length;
            this.addFailureAt(importValues.getEnd() - spacesLength, spacesLength - 1, Rule.FAILURE_STRING);
        }
        super.visitImportDeclaration(node);
    }
}
