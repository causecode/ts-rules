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
 * This class creates rule which checks for whether empty line is present before return statement or not.
 * 
 * @author Mahesh Bhuva
 * @since v0.0.1
 * 
 * @class EmptyLineBeforeReturn
 * @extends {Lint.RuleWalker}
 */
class EmptyLineBeforeReturn extends Lint.RuleWalker {
    public visitReturnStatement(node: ts.ReturnStatement) {
        const nodeText: string = node.getFullText();

        // start and end line no of parent node of return statement
        const parentLineStart: ts.LineAndCharacter = this.getLineAndCharacter(node.parent.getStart());
        const parentLineEnd: ts.LineAndCharacter = this.getLineAndCharacter(node.parent.getEnd());

        // start and end line no of return statement
        const lineStart: ts.LineAndCharacter = this.getLineAndCharacter(node.getStart());
        const lineEnd: ts.LineAndCharacter = this.getLineAndCharacter(node.getEnd());

        // indicates whether return statement is single line or multi line
        const noOfLines: number = lineEnd.line - lineStart.line;
        // no of lines of return statement by counting no of \n
        const newLines: number = nodeText.split(/[\n]/g).length;

        /*
         * First conditon checks whether empty line is present before return
         * and second condition checks whether 2 or more statements before return exists or not.
         * Difference between newLines and noOfLines will be 2 if there is no empty line before return
         * and 3 if there is empty line before return. So newLines < noOfLines + 3 holds true
         * when there is no empty line before return
         */ 
        if ((newLines < noOfLines + 3) && (parentLineEnd.line - parentLineStart.line - newLines > 1)) {
            this.addFailureAt(node.getStart(), 6, Rule.FAILURE_STRING);
        }

        super.visitReturnStatement(node);
    }

    public getLineAndCharacter = (position: number): ts.LineAndCharacter => {
        return ts.getLineAndCharacterOfPosition(this.getSourceFile(), position);
    }
}
