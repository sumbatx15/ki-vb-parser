import generate from '@babel/generator';
import * as t from '@babel/types';
import {parse as _parse} from '@babel/parser';
import fs from 'fs';
import {get, set} from 'lodash';
import {jsonData2 as data} from './jsonData';

/**
 * Define Types
 */
interface Input {
  key: string;
  value: any;
}

interface Element {
  nodeId: string;
  method: string;
  methodType: string;
  protocol: string;
  params: Input[];
}

interface Block {
  name: string;
  node: t.VariableDeclaration;
  element: Element;
}

type Blocks = Record<string, Block>;
type Output = {type: 'output'; id: {nodeId: string; innerIndex: number}};

/**
 * Configuration
 */
const IMPORT_PATHS = {
  FCT_CORE: '@kiroboio/fct-core',
  FCT_BUILDER: '@kiroboio/fct-builder',
};

const LITERAL_MAP: Record<string, (val: any) => t.Expression> = {
  boolean: t.booleanLiteral,
  number: t.numericLiteral,
  string: t.stringLiteral,
  undefined: () => t.identifier('undefined'),
  object: (val: any) =>
    val === null
      ? t.nullLiteral()
      : Array.isArray(val)
      ? t.arrayExpression(val.map(createLiteral))
      : createObjectExpression(val),
};

/**
 * Parsing Helpers
 */
const parse = <T>(code: string): T => {
  return _parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  }).program.body[0] as T;
};

const isOutput = (value: any): value is Output => {
  return typeof value === 'object' && value !== null && value.type === 'output' && value.id;
};

/**
 * AST Node Creation Helpers
 */
const createLiteral = (value: any): t.Expression => {
  return LITERAL_MAP[typeof value](value);
};

const createObjectExpression = (value: any): t.ObjectExpression | t.Expression => {
  if (isOutput(value)) return createOutputExpression(value);
  return t.objectExpression(
    Object.entries(value).map(([key, value]) => t.objectProperty(t.identifier(key), createLiteral(value)))
  );
};

const createPluginOptions = (inputs: Input[]): t.Expression => {
  const obj = inputs.reduce((acc, input) => set(acc, input.key, input.value), {});
  return createObjectExpression(obj);
};

/**
 * Block Creation
 */
const blocks: Blocks = {};
const protocolsSet: Set<string> = new Set();

const createPlugin = (element: Element): t.VariableDeclaration => {
  const {nodeId, method, methodType, protocol, params} = element;
  const name = `${protocol.toLocaleLowerCase()}_${method}_${data.indexOf(element)}`;
  protocolsSet.add(protocol);

  const plugin = createPluginDeclaration(name, [
    createMemberExpression([protocol, methodType, method]),
    createPluginOptions(params),
  ]);
  set(blocks, [nodeId], {name, node: plugin, element});

  return plugin;
};

/**
 * Declaration Creators
 */
const createPluginDeclaration = (name: string, _args: t.CallExpression['arguments']): t.VariableDeclaration => {
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(name),
      t.callExpression(t.memberExpression(t.identifier('fct'), t.identifier('add')), _args)
    ),
  ]);
};

const createImportDeclaration = (source: string, specifiers: t.ImportSpecifier[] = []) => {
  return t.importDeclaration(specifiers, t.stringLiteral(source));
};

const createOutputExpression = (value: Output): t.Expression => {
  const block = get(blocks, value.id.nodeId);
  const outputKey = get(block, ['element', 'outputs', value.id.innerIndex, 'key']);
  return createMemberExpression([block.name, 'outputs', outputKey]);
};

const createMemberExpression = (identifiers: string[]): t.Expression =>
  identifiers.length === 1
    ? t.identifier(identifiers[0])
    : t.memberExpression(
        createMemberExpression(identifiers.slice(0, -1)),
        t.identifier(identifiers[identifiers.length - 1])
      );

/**
 * Flow Statement Creator
 */
const createFctFlowStatement = (elements: Element[]): t.ExpressionStatement => {
  let currentExpression: t.Expression = t.identifier(blocks[elements[0].nodeId].name);
  for (let i = 1; i < elements.length; i++) {
    currentExpression = t.callExpression(t.memberExpression(currentExpression, t.identifier('then')), [
      t.identifier(blocks[elements[i].nodeId].name),
    ]);
  }

  return t.expressionStatement(
    t.callExpression(t.memberExpression(t.identifier('fct'), t.identifier('startWith')), [currentExpression])
  );
};

/**
 * Import Declaration Creators
 */
const createCoreImports = () => {
  const specifiers = Array.from(protocolsSet).map(protocol =>
    t.importSpecifier(t.identifier(protocol), t.identifier(protocol))
  );
  return createImportDeclaration(IMPORT_PATHS.FCT_CORE, specifiers);
};

const createBuilderImports = () => {
  const specifiers = [t.importSpecifier(t.identifier('create'), t.identifier('create'))];
  return createImportDeclaration(IMPORT_PATHS.FCT_BUILDER, specifiers);
};

/**
 * Main
 */
const fctInstanceDeclaration = t.variableDeclaration('const', [
  t.variableDeclarator(t.identifier('fct'), t.callExpression(t.identifier('create'), [])),
]);

const plugins = data.map(createPlugin);
const flow = createFctFlowStatement(data);

// Generate imports
const imports = [createCoreImports(), createBuilderImports()];
const importCode = generate(t.program(imports)).code;

const code = [fctInstanceDeclaration, ...plugins, flow].map(node => generate(t.program([node])).code).join('\n\n');

fs.writeFileSync('output.ts', `${importCode}\n\n${code}`);
