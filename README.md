# TSLINT RULES (0.0.1) #

## Usage

1. This packgae requires `tslint@5.1.0` or higher and `typescript@2.2.2`  
2. Add Following dependency in your project's `package.json` file and run `npm install`  
    * ```git+ssh://git@bitbucket.org/causecode/ts-rules.git#version```
    * (e.g. ```git+ssh://git@bitbucket.org/causecode/ts-rules.git#0.0.1```)
3. Add following in your project's `tslint.json` file.
    * `"rulesDirectory": ["./node_modules/ts-rules/public"]`
4. Add following custom rules to `rules` block
    *   ```
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

## Development ##

1. Clone the repo ```git clone git@bitbucket.org:causecode/ts-rules.git```
2. ```npm run install```
3. Add new custom rules to ```rules``` directory. [Guideline for developing rules](https://palantir.github.io/tslint/develop/custom-rules/)
4. Add test cases to ```test``` directory [Guideline for developing test cases for tslint rules](https://palantir.github.io/tslint/develop/testing-rules/)
5. Run ```npm run test``` for testing
