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
    public static FAILURE_STRING: string = 'Import from index not allowed.';
    
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoIndexImport(sourceFile, this.getOptions()));
    }
}

/**
 * @author Mahesh Bhuva
 * @since v0.0.1
 * 
 * @class NoIndexImport
 * @extends {Lint.RuleWalker}
 */
class NoIndexImport extends Lint.RuleWalker {
    public visitImportDeclaration(node: ts.ImportDeclaration) {
        const importPath: ts.Node = node.getChildAt(3);
        const regexp: RegExp = new RegExp(/index('|")$/, 'i');
        
        if (regexp.test(importPath.getFullText())) {
            this.addFailureAt(importPath.getEnd() - 6, 5, Rule.FAILURE_STRING);
        }

        super.visitImportDeclaration(node);
    }
}
