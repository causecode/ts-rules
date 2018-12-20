import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING: string = 'Remove space in import statement';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoImportSpace(sourceFile, this.getOptions()));
    }
}

/**
 * This class creates rule which checks for spaces around braces in import statement.
 * 
 * @author Mahesh Bhuva
 * @since v0.0.1
 * 
 * @class NoImportSpace
 * @extends {Lint.RuleWalker}
 */
class NoImportSpace extends Lint.RuleWalker {
    public visitImportDeclaration(node: ts.ImportDeclaration) {
        const importValues: ts.Node = node.getChildAt(1);
        const importText: string = importValues.getFullText().trim();

        // matches spaces at start of import (e.g "import {   React} from 'react';")
        const startRegex: RegExp = new RegExp(/^{\s+/);

        // matches spaces at end of import (e.g "import {React   } from 'react';")
        const endRegex: RegExp = new RegExp(/\s+}$/);

        const lineStart: ts.LineAndCharacter = ts.getLineAndCharacterOfPosition(this.getSourceFile(), node.getStart());
        const lineEnd: ts.LineAndCharacter = ts.getLineAndCharacterOfPosition(this.getSourceFile(), node.getEnd());
        
        if (startRegex.test(importText) && lineEnd.line - lineStart.line === 0) {
            const spacesLength: number = importText.match(startRegex)[0].length;
            this.addFailureAt(importValues.getStart() + 1, spacesLength - 1, Rule.FAILURE_STRING);
        }
        if (endRegex.test(importText) && lineEnd.line - lineStart.line === 0) {
            const spacesLength: number = importText.match(endRegex)[0].length;
            this.addFailureAt(importValues.getEnd() - spacesLength, spacesLength - 1, Rule.FAILURE_STRING);
        }

        super.visitImportDeclaration(node);
    }
}
