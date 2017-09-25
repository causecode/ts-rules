"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
const OPTION_INDENT_SIZE_2 = 2;
const OPTION_INDENT_SIZE_4 = 4;
const OPTION_USE_TABS = 'tabs';
const OPTION_USE_SPACES = 'spaces';
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        const options = parseOptions(this.ruleArguments);
        return options === undefined ? [] : this.applyWithFunction(sourceFile, walk, options);
    }
    static FAILURE_STRING(expected) {
        return `${expected} indentation expected`;
    }
}
exports.Rule = Rule;
function parseOptions(ruleArguments) {
    const type = ruleArguments[0];
    if (type !== OPTION_USE_TABS && type !== OPTION_USE_SPACES) {
        return;
    }
    const size = ruleArguments[1];
    const times = ruleArguments[2];
    return {
        type,
        size: (size === OPTION_INDENT_SIZE_2 || size === OPTION_INDENT_SIZE_4) ? size : undefined,
        times,
    };
}
function walk(ctx) {
    ts.forEachChild(ctx.sourceFile, function cb(node) {
        const { options } = ctx;
        const regex = options.type === 'tabs' ? new RegExp(/^\t+\S/) : new RegExp(/^\s+\S/);
        const failure = Rule.FAILURE_STRING(options.type === 'tabs' ?
            `${options.times} tabs` : `${options.size * options.times} spaces`);
        if (node.kind === ts.SyntaxKind.MethodDeclaration || node.kind === ts.SyntaxKind.ArrowFunction
            || node.kind === ts.SyntaxKind.JsxElement || node.kind === ts.SyntaxKind.JsxSelfClosingElement) {
            const lines = ctx.sourceFile.text.split(/\n/);
            const lineOfNode = ts.getLineAndCharacterOfPosition(ctx.sourceFile, node.getStart()).line;
            const lineRegExpMatcher = lines[lineOfNode].match(regex);
            let startSpaces = lineRegExpMatcher ? lineRegExpMatcher[0].length : 0;
            let childNodes = node;
            if (startSpaces > 0) {
                startSpaces--;
            }
            if (node.kind === ts.SyntaxKind.JsxElement || node.kind === ts.SyntaxKind.JsxSelfClosingElement) {
                if (node.getChildCount() === 3) {
                    childNodes = node.getChildAt(0).getChildAt(2);
                }
                else if (node.getChildCount() === 5) {
                    childNodes = node.getChildAt(2);
                }
            }
            if (childNodes.kind === ts.SyntaxKind.SyntaxList) {
                for (let i = 0; i < childNodes.getChildCount(); i++) {
                    const param = childNodes.getChildAt(i);
                    if (param.kind === ts.SyntaxKind.JsxAttribute &&
                        paramInNewLine(ctx.sourceFile, param, lineOfNode)) {
                        throwError(ctx, startSpaces, param, options, regex, failure);
                    }
                }
            }
            else {
                ts.forEachChild(childNodes, (param) => {
                    if (param.kind === ts.SyntaxKind.Parameter && paramInNewLine(ctx.sourceFile, param, lineOfNode)) {
                        throwError(ctx, startSpaces, param, options, regex, failure);
                    }
                });
            }
        }
        ts.forEachChild(node, cb);
    });
}
function validIndentation(startSpaces, param, options, regex) {
    const tokens = param.getFullText().split(/\n/);
    const paramText = tokens[tokens.length - 1];
    const regexResult = paramText.match(regex);
    let spaces = regexResult ? regexResult[0].length : 0;
    if (spaces > 0) {
        spaces--;
    }
    if (options.type === 'spaces' && (startSpaces + options.size * options.times) === spaces) {
        return true;
    }
    else if (options.type === 'tabs' && (startSpaces + options.times) === spaces) {
        return true;
    }
    return false;
}
function paramInNewLine(sourceFile, param, nodeLineNo) {
    const paramLineNo = ts.getLineAndCharacterOfPosition(sourceFile, param.getStart()).line;
    if (paramLineNo === nodeLineNo) {
        return false;
    }
    return true;
}
function throwError(ctx, startSpaces, param, options, regex, failure) {
    if (!validIndentation(startSpaces, param, options, regex)) {
        ctx.addFailureAt(param.getStart(), param.getFullText().trim().length, failure);
    }
}
