import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Put empty line before return statement.';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new EmptyLineBeforeReturn(sourceFile, this.getOptions()));
    }

}

class EmptyLineBeforeReturn extends Lint.RuleWalker {
    public visitReturnStatement(node: ts.ReturnStatement) {
        if (node.getFullText().split(/[\n]/g).length < 3) {
            this.addFailureAt(node.getStart(), 6, Rule.FAILURE_STRING);
        }

        super.visitReturnStatement(node);
    }
}