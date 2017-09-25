"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithFunction(sourceFile, walk);
    }
}
Rule.FAILURE_STRING = 'Resource name and Model name must be same.';
exports.Rule = Rule;
function walk(ctx) {
    const fileNameRegExpMatcher = ctx.sourceFile.fileName.match(/\/\w+Model\.(ts|tsx)/);
    const fileName = fileNameRegExpMatcher ? fileNameRegExpMatcher[0] : '';
    if (fileName.indexOf('Model') === -1) {
        return;
    }
    const resource = fileName.substring(1, fileName.indexOf('Model')).toLowerCase();
    ts.forEachChild(ctx.sourceFile, function cb(node) {
        const nodeText = node.getFullText();
        if (node.kind === ts.SyntaxKind.PropertyDeclaration && nodeText.indexOf('resourceName') !== -1) {
            const regex = new RegExp(/('|")\w+('|")/);
            const matchedString = nodeText.match(regex)[0];
            const resourceName = matchedString.substring(1, matchedString.length - 1).toLowerCase();
            if (resource !== resourceName) {
                ctx.addFailureAt(node.getStart() + nodeText.trim().search(regex) + 1, resourceName.length, Rule.FAILURE_STRING);
            }
        }
        ts.forEachChild(node, cb);
    });
}
