import * as ts from "typescript";
import * as Lint from "tslint";

const OPTION_INDENT_SIZE_2 = 2;
const OPTION_INDENT_SIZE_4 = 4;
const OPTION_USE_TABS = "tabs";
const OPTION_USE_SPACES = "spaces";

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
    if (type !== OPTION_USE_TABS && type !== OPTION_USE_SPACES) { return undefined; }
    const size = ruleArguments[1] as number | undefined;
    const times = ruleArguments[2] as number | undefined;
    return {
        type: type,
        size: size === OPTION_INDENT_SIZE_2 || size === OPTION_INDENT_SIZE_4 ? size : undefined,
        times: times,
    };
}

function walk(ctx: Lint.WalkContext<IOptions>) {
    return ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
        const {options} = ctx;
        let regex: RegExp = options.type === 'tabs' ? new RegExp(/^\t+\S/) : new RegExp(/^\s+\S/);
        const failure: string = Rule.FAILURE_STRING(options.type === 'tabs' ? `${options.times} tabs` :`${options.size * options.times} spaces`);

        if (node.kind === ts.SyntaxKind.MethodDeclaration || node.kind === ts.SyntaxKind.ArrowFunction || node.kind === ts.SyntaxKind.JsxElement || node.kind === ts.SyntaxKind.JsxSelfClosingElement) {
            let lines: string[] = ctx.sourceFile.text.split(/\n/);
            let lineOfNode: number = ts.getLineAndCharacterOfPosition(ctx.sourceFile, node.getStart()).line;
            let lineRegExpMatcher: RegExpMatchArray | null = lines[lineOfNode].match(regex);
            let startSpaces: number = lineRegExpMatcher ? lineRegExpMatcher[0].length : 0;
            if (startSpaces > 0) {
                startSpaces--;
            }

            let lastParamLineNo: number;
            let childNodes: ts.Node = node;
            if (node.kind === ts.SyntaxKind.JsxElement || node.kind === ts.SyntaxKind.JsxSelfClosingElement) {
                if (node.getChildCount() === 3) {
                    childNodes = node.getChildAt(0).getChildAt(2);
                } else if (node.getChildCount() === 5) {
                    childNodes = node.getChildAt(2);
                }
            }
            if (childNodes.kind === ts.SyntaxKind.SyntaxList) {
                for (let i=0; i < childNodes.getChildCount(); i++) {
                    let param: ts.Node = childNodes.getChildAt(i);
                    if (param.kind === ts.SyntaxKind.JsxAttribute && paramInNewLine(ctx.sourceFile, param, lineOfNode)) {
                        if(!validIndentation(startSpaces, param, options, regex)) {
                            return ctx.addFailureAt(param.getStart(), param.getFullText().trim().length, failure);
                        }
                    }
                }
            } else {
                ts.forEachChild(childNodes, (param: ts.Node) => {
                    if (param.kind === ts.SyntaxKind.Parameter) {
                        if (paramInNewLine(ctx.sourceFile, param, lineOfNode)) {
                            if(!validIndentation(startSpaces, param, options, regex)) {
                                return ctx.addFailureAt(param.getStart(), param.getFullText().trim().length, failure);
                            }
                        }
                    }
                });
            }
        }

        return ts.forEachChild(node, cb);
    });
}

interface IOptions {
    readonly type?: string;
    readonly size?: 2 | 4;
    readonly times?: number;
}

function validIndentation(startSpaces:number, param: ts.Node, options: IOptions, regex: RegExp): boolean {
    let tokens: string[] = param.getFullText().split(/\n/);
    let paramText: string = tokens[tokens.length - 1];
    let regexResult: RegExpMatchArray | null = paramText.match(regex);
    let spaces: number = regexResult ? regexResult[0].length : 0;
    if (spaces > 0) {
        spaces--;
    }
    if (options.type === 'spaces' && (startSpaces + options.size * options.times) === spaces) {
        return true;
    } else if(options.type === 'tabs' && (startSpaces + options.times) === spaces) {
        return true;
    }

    return false;
}

function paramInNewLine(sourceFile: ts.SourceFile, param: ts.Node, nodeLineNo: number): boolean {
    let paramLineNo: number = ts.getLineAndCharacterOfPosition(sourceFile, param.getStart()).line;
    if (paramLineNo === nodeLineNo) {
        return false;
    }

    return true;
}