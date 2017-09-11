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
    public static FAILURE_STRING: string = 'Resource name and Model name must be same.';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

/**
 * This function will be invoked once for every file
 * @author Mahesh Bhuva
 * @since v0.0.1
 * @param {Lint.WalkContext<void>} ctx 
 * @returns 
 */
function walk(ctx: Lint.WalkContext<void>): void {
    // fileName will begin with / (e.g '/BlogModel.ts')
    const fileNameRegExpMatcher: RegExpMatchArray | null = ctx.sourceFile.fileName.match(/\/\w+Model\.(ts|tsx)/);
    const fileName: string = fileNameRegExpMatcher ? fileNameRegExpMatcher[0] : '';
    if (fileName.indexOf('Model') === -1) {
        return;
    }

    // Resource contains name of file without Model e.g Blog in case of BlogModel
    const resource: string = fileName.substring(1, fileName.indexOf('Model')).toLowerCase();

    /*
     * Iterating over children of file recursively and looking for resourceName property.
     */
    ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
        const nodeText: string = node.getFullText();

        if (node.kind === ts.SyntaxKind.PropertyDeclaration && nodeText.indexOf('resourceName') !== -1) {
            const regex: RegExp = new RegExp(/('|")\w+('|")/);
            
            // matchedString contains value contained in resourceName
            const matchedString: string = nodeText.match(regex)[0]; 
            const resourceName: string = matchedString.substring(1, matchedString.length - 1).toLowerCase();

            if (resource !== resourceName) {
               ctx.addFailureAt(
                   node.getStart() + nodeText.trim().search(regex) + 1,
                   resourceName.length, Rule.FAILURE_STRING
                ); 
            }
        }

        ts.forEachChild(node, cb);
    });
}
