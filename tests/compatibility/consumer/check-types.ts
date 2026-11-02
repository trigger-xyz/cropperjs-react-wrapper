import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

const previousFile = resolve('node_modules/previous-wrapper/dist/index.d.ts');
const currentFile = resolve(
  'node_modules/cropperjs-react-wrapper/dist/index.d.ts',
);
const previous = ts.createSourceFile(
  previousFile,
  readFileSync(previousFile, 'utf8'),
  ts.ScriptTarget.Latest,
  true,
);
const types = previous.statements
  .filter(ts.isExportDeclaration)
  .filter((statement) => statement.isTypeOnly)
  .flatMap((statement) =>
    statement.exportClause && ts.isNamedExports(statement.exportClause)
      ? statement.exportClause.elements.map((element) => element.name.text)
      : [],
  );
assert(types.length > 0, 'The baseline declarations must expose types');
writeFileSync(
  'api-compatibility.ts',
  [
    "import type * as Previous from 'previous-wrapper';",
    "import type * as Current from 'cropperjs-react-wrapper';",
    'type Assert<T extends true> = T;',
    ...types.map(
      (name) =>
        `type Compatible_${name} = Assert<Previous.${name} extends Current.${name} ? true : false>;`,
    ),
  ].join('\n'),
);

const configFile = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
assert.equal(configFile.error, undefined);
const config = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  process.cwd(),
);
const program = ts.createProgram(config.fileNames, config.options);
const errors = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
if (errors.length) {
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(errors, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (file) => file,
      getNewLine: () => '\n',
    }),
  );
}

const checker = program.getTypeChecker();
function exportsOf(file: string): ts.Symbol[] {
  const source = program.getSourceFile(file);
  assert(source, `Missing declarations: ${file}`);
  const symbol = checker.getSymbolAtLocation(source);
  assert(symbol, `Missing module: ${file}`);
  return checker.getExportsOfModule(symbol);
}
const oldExports = exportsOf(previousFile);
const newExports = exportsOf(currentFile);
assert.deepEqual(
  oldExports
    .filter((old) => !newExports.some((current) => current.name === old.name))
    .map((old) => old.name),
  [],
  'Public exports were removed',
);
for (const old of oldExports.filter((symbol) =>
  symbol.name.endsWith('Props'),
)) {
  const current = newExports.find((symbol) => symbol.name === old.name);
  assert(current);
  const before = checker.getPropertiesOfType(
    checker.getDeclaredTypeOfSymbol(old),
  );
  const after = checker.getPropertiesOfType(
    checker.getDeclaredTypeOfSymbol(current),
  );
  assert.deepEqual(
    before
      .filter(
        (prop) => !after.some((candidate) => candidate.name === prop.name),
      )
      .map((prop) => prop.name),
    [],
    `${old.name} lost props`,
  );
}
console.log(
  `TypeScript ${ts.version}: legacy JSX compiles; ${oldExports.length} baseline exports retained`,
);
