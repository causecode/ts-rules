# TSLINT RULES (0.0.2) #

## Usage

1. This packgae requires `tslint@5.1.0` or higher and `typescript@2.2.2`  
2. Add Following dependency in your project's `package.json` file and run `npm install`  
    * ```git+ssh://git@github.com/causecode/ts-rules.git#version```
    * (e.g. ```git+ssh://git@github.com/causecode/ts-rules.git#v0.0.1```)
3. Add following in your project's `tslint.json` file.
    * `"rulesDirectory": ["./node_modules/ts-rules/public"]`
4. Add following custom rules to `rules` block  
    ```
    "new-line-indent": [true,"spaces", 4, 2],
    "no-index-import": true,
    "no-import-spaces": true,
    "empty-line-before-return": true,
    "no-anchor-href": {
        "severity": "warning"
    },
    "model-resource-name": true
    ```
    
    * for e.g. your tslint.json will look something like this.
    ```
    {
        "rulesDirectory": ["./node_modules/ts-rules/public"],
        "rules": {
            "new-line-indent": [true,"spaces", 4, 2],
            "no-index-import": true,
            "no-import-spaces": true,
            "empty-line-before-return": true,
            "no-anchor-href": {
                "severity": "warning"
            },
            "model-resource-name": true
        }
    }
    ```

5. Now when you run `npm run lint-ts` (it is assumed that this command is preconfigured in your project), it will show appropriate error/warning along with line no.  
6. If you get this `error TS2403: Subsequent variable declarations must have the same type.  Variable 'require' must be of type '{ <T>(path: string): T; (paths: string[], callback: (...modules: any[]) => void): void; ensure: (...', but here has type 'NodeRequire'` compile time error, then check you project's `ambientInterfaces.d.ts`, remove existing type declaration for `require` and then add following type for `require`.  
```
declare interface NodeRequire {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
}

declare var require: NodeRequire;  
```

## Development ##

1. Clone the repo ```git clone git@github.com:causecode/ts-rules.git```
2. ```npm run install```
3. Add new custom rules to ```rules``` directory. [Guideline for developing rules](https://palantir.github.io/tslint/develop/custom-rules/)
4. Add test cases to ```test``` directory [Guideline for developing test cases for tslint rules](https://palantir.github.io/tslint/develop/testing-rules/)
5. Run ```npm run test``` for testing
