/*
 * Copyright (c) 2017-Present, CauseCode Technologies Pvt Ltd, India.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or
 * without modification, are not permitted.
 */

import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING: string = 'Missing empty line before return.';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new EmptyLineBeforeReturn(sourceFile, this.getOptions()));
    }
}

/**
 * @author Mahesh Bhuva
 * @since v0.0.1
 * 
 * @class EmptyLineBeforeReturn
 * @extends {Lint.RuleWalker}
 */
class EmptyLineBeforeReturn extends Lint.RuleWalker {
    public visitReturnStatement(node: ts.ReturnStatement) {
        const nodeText: string = node.getFullText();
        const parentLineStart: ts.LineAndCharacter = this.getLineAndCharacter(node.parent.getStart());
        const parentLineEnd: ts.LineAndCharacter = this.getLineAndCharacter(node.parent.getEnd());
        const lineStart: ts.LineAndCharacter = this.getLineAndCharacter(node.getStart());
        const lineEnd: ts.LineAndCharacter = this.getLineAndCharacter(node.getEnd());
        const noOfLines: number = lineEnd.line - lineStart.line;
        const newLines: number = nodeText.split(/[\n]/g).length;

        /*
         * First conditon in if block checks for empty line before return
         * and second condition checks for statements other than return
         */ 
        if ((newLines < noOfLines + 3) && (parentLineEnd.line - parentLineStart.line - newLines > 1)) {
            this.addFailureAt(node.getStart(), 6, Rule.FAILURE_STRING);
        }

        super.visitReturnStatement(node);
    }

    public getLineAndCharacter = (position: number) => {
        return ts.getLineAndCharacterOfPosition(this.getSourceFile(), position);
    }
}
