<!-- "prepare": "husky install" in package.json -->

```json5
{
    name: "backend",
    version: "1.0.0",
    main: "index.js",
    scripts: {
        start: "node dist/index.js", // start the node server
        dev: "nodemon index.ts", // start the node server in development mode
        build: "tsc", // build the typescript code
        lint: "eslint . --ext .js,.jsx,.ts,.tsx", // lint the code
        "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix", // fix the lint errors
        prettier: "prettier --write .", // format the code
    },
    keywords: [],
    author: "",
    license: "ISC",
    description: "",
    dependencies: {
        bcrypt: "^5.1.1",
        "cookie-parser": "^1.4.7",
        cors: "^2.8.5",
        express: "^4.19.2",
        jsonwebtoken: "^9.0.2",
        mongoose: "^8.13.2",
        multer: "^1.4.5-lts.2",
    },
    devDependencies: {
        "@eslint/js": "^9.24.0",
        "@types/bcrypt": "^5.0.2",
        "@types/cookie-parser": "^1.4.8",
        "@types/cors": "^2.8.17",
        "@types/express": "^4.17.21",
        "@types/jsonwebtoken": "^9.0.9",
        "@types/multer": "^1.4.12",
        eslint: "^9.24.0",
        "eslint-config-prettier": "^10.1.1",
        "eslint-plugin-prettier": "^5.2.6",
        globals: "^16.0.0",
        prettier: "^3.5.3",
        typescript: "^5.8.3",
        "typescript-eslint": "^8.29.0",
    },
}
```
