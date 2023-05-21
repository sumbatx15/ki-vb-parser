import generate from '@babel/generator';
import * as t from '@babel/types';
import fs from 'fs';
import { get, set } from 'lodash';
export const jsonData = [
  {
    nodeId: 'f70d02d6-b486-4cf2-ae3a-9864899bec7e',
    method: 'balanceOf',
    methodType: 'getters',
    protocol: 'ERC20',
    params: [
      {
        key: 'to',
        value: '0xba232b47a7ddfccc221916cf08da03a4973d3a1d',
      },
      {
        key: 'methodParams.owner',
        value: {
          first: '0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4',
          second: '0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4'
        },
      },
      {
        key: 'methodParams.dani.value',
        value: '0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4',
      },
    ],
    outputs: [
      { key: 'balance' },
      { key: 'stamOutput' }
    ]
  },
  {
    nodeId: 'd6077464-2afb-4450-a68e-0d91de4b6d1a',
    method: 'simpleTransfer',
    methodType: 'actions',
    protocol: 'TokenValidator',
    params: [
      {
        key: 'to',
        value: '0xba232b47a7ddfccc221916cf08da03a4973d3a1d',
      },
      {
        key: 'isVault',
        value: true,
      },
      {
        key: 'methodParams.from',
        value: '0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4',
      },
      {
        key: 'methodParams.to',
        value: '0x683C0803F89308c4e05e14Dcfc51eCEBF7889f6c',
      },
      {
        key: 'methodParams.amount',
        value: {
          type: 'output',
          id: {
            innerIndex: 0,
            nodeId: 'f70d02d6-b486-4cf2-ae3a-9864899bec7e',
          },
        },
      },
      {
        key: 'methodParams.danini.value',
        value: {
          type: 'output',
          id: {
            innerIndex: 0,
            nodeId: 'f70d02d6-b486-4cf2-ae3a-9864899bec7e',
          },
        },
      },
    ],
  },
  {
    nodeId: 'd6077464-2afb-4450-a68e-0d91de442d1a',
    method: 'BodekEtHaAST',
    methodType: 'getters',
    protocol: 'StamZorekPoDvarim',
    params: [
      {
        key: 'to',
        value: '0xba232b47a7ddfccc221916cf08da03a4973d3a1d',
      },
      {
        key: 'isVault',
        value: true,
      },
      {
        key: 'methodParams.from',
        value: '0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4',
      },
      {
        key: 'methodParams.to',
        value: '0x683C0803F89308c4e05e14Dcfc51eCEBF7889f6c',
      },
      {
        key: 'methodParams.amount',
        value: {
          type: 'output',
          id: {
            innerIndex: 0,
            nodeId: 'f70d02d6-b486-4cf2-ae3a-9864899bec7e',
          },
        },
      },
      {
        key: 'methodParams.danini.value',
        value: {
          type: 'output',
          id: {
            innerIndex: 1,
            nodeId: 'f70d02d6-b486-4cf2-ae3a-9864899bec7e',
          },
        },
      },
    ],
  },
];

function createChainedMemberExpression(identifiers: string[]): t.MemberExpression | t.Identifier {
  if (identifiers.length === 1) {
    return t.identifier(identifiers[0]);
  }

  return t.memberExpression(
    createChainedMemberExpression(identifiers.slice(0, -1)),
    t.identifier(identifiers[identifiers.length - 1])
  );
}

const isOutput = (value: any): value is { type: 'output'; id: { nodeId: string; innerIndex: number } } => {
  return typeof value === 'object' && value !== null && value.type === 'output' && value.id;
}

const createLiteral = (value: any): t.Literal | t.ArrayExpression | t.ObjectExpression | t.MemberExpression | t.Identifier => {
  if (typeof value === 'string')
    return t.stringLiteral(value);

  if (typeof value === 'number')
    return t.numericLiteral(value);

  if (typeof value === 'boolean')
    return t.booleanLiteral(value);

  if (Array.isArray(value))
    return t.arrayExpression(value.map(v => createLiteral(v)));

  if (isOutput(value)) {
    const block = get(blocks, value.id.nodeId);
    const output = get(block, ['element', 'outputs', value.id.innerIndex, 'key']);
    return createChainedMemberExpression([block.name, 'outputs', output]);
  }


  return t.objectExpression(
    Object.entries(value).map(([key, value]) => {
      return t.objectProperty(t.identifier(key), createLiteral(value));
    })
  );
}

const blocks: Record<string, {
  name: string;
  node: t.VariableDeclaration;
  element: typeof jsonData[0];
}> = {}

const fctCoreImport = t.importDeclaration([], t.stringLiteral('@kiroboio/fct-core'));
const fctBuilderImport = t.importDeclaration([
  t.importSpecifier(t.identifier('create'), t.identifier('create')),
], t.stringLiteral('@kiroboio/fct-builder'));

function createObjectExpressionFromInputs(inputs: typeof jsonData[0]['params']): t.ObjectExpression {
  const obj = {};

  inputs.forEach(input => {
    set(obj, input.key, input.value);
  });

  const mapped = Object.entries(obj).map(([key, value]) => {
    return t.objectProperty(t.identifier(key), createLiteral(value));
  })

  return t.objectExpression(mapped);
}

const createBlock = (element: typeof jsonData[0]) => {
  const { nodeId, method, methodType, protocol, params } = element;
  const name = `${method}`;

  const protocolSpecifier = fctCoreImport.specifiers.find(specifier => {
    return t.isImportSpecifier(specifier) && t.isIdentifier(specifier.imported) && specifier.imported.name === protocol;
  });

  if (!protocolSpecifier) {
    fctCoreImport.specifiers.push(t.importSpecifier(t.identifier(protocol), t.identifier(protocol)));
  }

  const block = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(name),
      t.callExpression(
        t.memberExpression(t.identifier('fct'), t.identifier('add')),
        [
          createChainedMemberExpression([protocol, methodType, method]),
          createObjectExpressionFromInputs(params),
        ]
      )
    ),
  ]);

  set(blocks, [nodeId], {
    name,
    node: block,
    element,
  });

  return block
}


const createCallExpressions = (elements: typeof jsonData) => {
  // Create the initial identifier: balance
  let currentExpression: t.Expression = t.identifier(blocks[elements[0].nodeId].name);

  // Chain .then(transfer) calls
  for (let i = 1; i < elements.length; i++) {
    currentExpression = t.callExpression(
      t.memberExpression(
        currentExpression,
        t.identifier('then')
      ),
      [t.identifier(blocks[elements[i].nodeId].name)]
    );
  }

  // Create the final call expression: fct.startWith(currentExpression)
  return t.expressionStatement(t.callExpression(
    t.memberExpression(
      t.identifier('fct'),
      t.identifier('startWith')
    ),
    [currentExpression]
  ));
};


const fctCreateDeclaration = t.variableDeclaration('const', [
  t.variableDeclarator(
    t.identifier('fct'),
    t.callExpression(
      t.identifier('create'),
      []
    )
  ),
]);

const objects = jsonData.map(createBlock);
const calls = createCallExpressions(jsonData);

fctCoreImport.leadingComments = [{
  type: 'CommentBlock',
  value: 'This file was generated by @kiroboio/fct-builder',
}]
const imports = [fctCoreImport, fctBuilderImport].map(node => generate(t.program([node])).code).join('\n');

const code = [fctCreateDeclaration, ...objects, calls].map(node => {
  return generate(t.program([node])).code;
}).join('\n\n');


fs.writeFileSync('output.ts', `${imports}\n\n${code}`);

