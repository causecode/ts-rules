"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lint = require("tslint");
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new NoIndexImport(sourceFile, this.getOptions()));
    }
}
Rule.FAILURE_STRING = 'Import from index not allowed.';
exports.Rule = Rule;
class NoIndexImport extends Lint.RuleWalker {
    visitImportDeclaration(node) {
        const importPath = node.getChildAt(3);
        const regexp = new RegExp(/index('|")$/, 'i');
        if (regexp.test(importPath.getFullText())) {
            this.addFailureAt(importPath.getEnd() - 6, 5, Rule.FAILURE_STRING);
        }
        super.visitImportDeclaration(node);
    }
}
