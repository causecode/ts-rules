import * as ts from 'typescript';
import * as Lint from 'tslint';
export declare class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
    static FAILURE_STRING(expected: string): string;
}
