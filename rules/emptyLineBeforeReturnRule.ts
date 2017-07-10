import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING: string = 'Missing empty line before return.';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new EmptyLineBeforeReturn(sourceFile, this.getOptions()));
    }

}

class EmptyLineBeforeReturn extends Lint.RuleWalker {
    public visitReturnStatement(node: ts.ReturnStatement) {
        let nodeText: string = node.getFullText();
        let parentLineStart: ts.LineAndCharacter = ts.getLineAndCharacterOfPosition(this.getSourceFile(), node.parent.getStart());
        let parentLineEnd: ts.LineAndCharacter = ts.getLineAndCharacterOfPosition(this.getSourceFile(), node.parent.getEnd());
        let lineStart: ts.LineAndCharacter = ts.getLineAndCharacterOfPosition(this.getSourceFile(), node.getStart());
        let lineEnd: ts.LineAndCharacter = ts.getLineAndCharacterOfPosition(this.getSourceFile(), node.getEnd());
        let noOfLines: number = lineEnd.line - lineStart.line;
        let newLines: number = nodeText.split(/[\n]/g).length;

        // first conditon in if block checks for empty line before return
        // and secnod condition checks for statements other than return
        if ((newLines < noOfLines + 3) && (parentLineEnd.line - parentLineStart.line - newLines > 1)) {
            this.addFailureAt(node.getStart(), 6, Rule.FAILURE_STRING);
        }

        super.visitReturnStatement(node);
    }
}