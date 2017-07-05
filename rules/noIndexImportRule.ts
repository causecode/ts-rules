import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Import from index not allowed.';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoIndexImport(sourceFile, this.getOptions()));
    }
}

class NoIndexImport extends Lint.RuleWalker {
    public visitImportDeclaration(node: ts.ImportDeclaration) {
        let importPath: ts.Node = node.getChildAt(3);
        let regexp = new RegExp(/index('|")$/, 'i');
        
        if (regexp.test(importPath.getFullText())) {
            this.addFailureAt(importPath.getEnd() - 6, 5, Rule.FAILURE_STRING);
        }

        super.visitImportDeclaration(node);
    }
}