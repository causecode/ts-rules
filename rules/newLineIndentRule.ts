/*
 * Copyright (c) 2017-Present, CauseCode Technologies Pvt Ltd, India.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or
 * without modification, are not permitted.
 */

import * as ts from 'typescript';
import * as Lint from 'tslint';

const OPTION_INDENT_SIZE_2 = 2;
const OPTION_INDENT_SIZE_4 = 4;
const OPTION_USE_TABS = 'tabs';
const OPTION_USE_SPACES = 'spaces';

/**
 * This class creates rule which checks for indentation specified in options when jsx attribute of
 * compoent is placed on new line or parameters of function is placed on next line.
 * 
 * @author Mahesh Bhuva
 * @since v0.0.1
 * 
 * @export
 * @class Rule
 * @extends {Lint.Rules.AbstractRule}
 */
export class Rule extends Lint.Rules.AbstractRule {

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const options = parseOptions(this.ruleArguments);
        return options === undefined ? [] : this.applyWithFunction(sourceFile, walk, options);
    }

    public static FAILURE_STRING(expected: string): string {
        return `${expected} indentation expected`;
    }
}


function parseOptions(ruleArguments: any[]): IOptions | undefined {
    const type = ruleArguments[0] as string;
    if (type !== OPTION_USE_TABS && type !== OPTION_USE_SPACES) {
        return;
    }
    const size = ruleArguments[1] as number | undefined;
    const times = ruleArguments[2] as number | undefined;

    return {
        type,
        size: (size === OPTION_INDENT_SIZE_2 || size === OPTION_INDENT_SIZE_4) ? size : undefined,
        times,
    };
}

function walk(ctx: Lint.WalkContext<IOptions>): void {
    ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
        const {options} = ctx;
        const regex: RegExp = options.type === 'tabs' ? new RegExp(/^\t+\S/) : new RegExp(/^\s+\S/);
        const failure: string = Rule.FAILURE_STRING(options.type === 'tabs' ?
                `${options.times} tabs` : `${options.size * options.times} spaces`);

        /*
         * Here, we are checking for either attributes of JSX Element or parameters of function.
         * So, this condition checks if node is JSX Element or arrow function or normal method declaration.
         */
        if (node.kind === ts.SyntaxKind.MethodDeclaration || node.kind === ts.SyntaxKind.ArrowFunction
                || node.kind === ts.SyntaxKind.JsxElement || node.kind === ts.SyntaxKind.JsxSelfClosingElement) {
            const lines: string[] = ctx.sourceFile.text.split(/\n/);
            const lineOfNode: number = ts.getLineAndCharacterOfPosition(ctx.sourceFile, node.getStart()).line;
            const lineRegExpMatcher: RegExpMatchArray | null = lines[lineOfNode].match(regex);
            let startSpaces: number = lineRegExpMatcher ? lineRegExpMatcher[0].length : 0;
            let childNodes: ts.Node = node;

            if (startSpaces > 0) {
                startSpaces--;
            }

            /*
             * This condition checks if the node is JSX Element or not and if node is JSX Element then depending on
             * either it is self closing jsx element or not, we are getting its JSX attributes (props)
             */
            if (node.kind === ts.SyntaxKind.JsxElement || node.kind === ts.SyntaxKind.JsxSelfClosingElement) {
                if (node.getChildCount() === 3) {
                    childNodes = node.getChildAt(0).getChildAt(2).getChildAt(0);
                } else if (node.getChildCount() === 5) {
                    childNodes = node.getChildAt(2).getChildAt(0);
                }
            }

            /*
             * This condition checks if given child node is SyntaxList(attributes of component) or not and if so,
             * then checking for indentation
             */
            if (childNodes.kind === ts.SyntaxKind.SyntaxList) {
                for (let i = 0; i < childNodes.getChildCount(); i++) {
                    const param: ts.Node = childNodes.getChildAt(i);
                    if (param.kind === ts.SyntaxKind.JsxAttribute &&
                            paramInNewLine(ctx.sourceFile, param, lineOfNode)) {
                        throwError(ctx, startSpaces, param, options, regex, failure);
                    }
                }

            /*
             * This part is executed if child node is parameters of function and indentation is checked.
             */
            } else {
                ts.forEachChild(childNodes, (param: ts.Node) => {
                    if (param.kind === ts.SyntaxKind.Parameter && paramInNewLine(ctx.sourceFile, param, lineOfNode)) {
                        throwError(ctx, startSpaces, param, options, regex, failure);
                    }
                });
            }
        }

        ts.forEachChild(node, cb);
    });
}

interface IOptions {
    readonly type?: string;
    readonly size?: 2 | 4;
    readonly times?: number;
}

function validIndentation(startSpaces: number, param: ts.Node, options: IOptions, regex: RegExp): boolean {
    const tokens: string[] = param.getFullText().split(/\n/);
    const paramText: string = tokens[tokens.length - 1];
    const regexResult: RegExpMatchArray | null = paramText.match(regex);
    let spaces: number = regexResult ? regexResult[0].length : 0;

    if (spaces > 0) {
        spaces--;
    }

    if (options.type === 'spaces' && (startSpaces + options.size * options.times) === spaces) {
        return true;
    } else if (options.type === 'tabs' && (startSpaces + options.times) === spaces) {
        return true;
    }

    return false;
}

function paramInNewLine(sourceFile: ts.SourceFile, param: ts.Node, nodeLineNo: number): boolean {
    const paramLineNo: number = ts.getLineAndCharacterOfPosition(sourceFile, param.getStart()).line;

    if (paramLineNo === nodeLineNo) {
        return false;
    }

    return true;
}

function throwError(
        ctx: Lint.WalkContext<IOptions>,
        startSpaces: number,
        param: ts.Node,
        options: IOptions,
        regex: RegExp,
        failure: string
) {
    if (!validIndentation(startSpaces, param, options, regex)) {
        ctx.addFailureAt(param.getStart(), param.getFullText().trim().length, failure);
    }
}
