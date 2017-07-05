import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Remove space in import statement';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoImportSpace(sourceFile, this.getOptions()));
    }
}

class NoImportSpace extends Lint.RuleWalker {
    public visitImportDeclaration(node: ts.ImportDeclaration) {
        let importValues: ts.Node = node.getChildAt(1);
        let importText: string = importValues.getFullText().trim();

        // matches spaces at start of import (e.g "import {   React} from 'react';")
        let startRegex = new RegExp(/^{\s+/);

        // matches spaces at end of import (e.g "import {React   } from 'react';")
        let endRegex = new RegExp(/\s+}$/);

        if (startRegex.test(importText)) {
            this.addFailureAt(importValues.getStart() + 1, importText.match(startRegex)[0].length - 1, Rule.FAILURE_STRING);
        }
        if (endRegex.test(importText)) {
            this.addFailureAt(importValues.getEnd() - importText.match(endRegex)[0].length, importText.match(endRegex)[0].length - 1, Rule.FAILURE_STRING);
        }

        super.visitImportDeclaration(node);
    }
}