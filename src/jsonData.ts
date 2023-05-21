export const jsonData2 = [
  {
    nodeId: 'f70d02d6-b486-4cf2-ae3a-9864899bec7e',
    method: 'balanceOf',
    methodType: 'getters',
    protocol: 'ERC20',
    params: [
      {
        key: 'to',
        value: ['0xba232b47a7ddfccc221916cf08da03a4973d3a1d', undefined],
      },
      {
        key: 'methodParams.owner',
        value: {
          first: '0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4',
          second: '0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4',
        },
      },
    ],
    outputs: [{key: 'balance'}],
  },
  {
    nodeId: 'd6077464-2afb-4450-a68e-0d91de4b6d1a',
    method: 'simpleTransfer',
    methodType: 'actions',
    protocol: 'ERC20',
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
    ],
  },
  {
    nodeId: 'f70d02d6-b486-4cf2-ae3a-9864892bec7e',
    method: 'transfer',
    methodType: 'actions',
    protocol: 'ERC721',
    params: [
      {
        key: 'to',
        value: '0xba232b47a7ddfccc221916cf08da03a4973d3a1d',
      },
      {
        key: 'methodParams.owner',
        value: '0xba232b47a7ddfccc221916cf08da03a4973d3a1d',
      },
    ],
    outputs: [{key: 'balance'}],
  },
  {
    nodeId: 'f70d02d6-b486-4cf2-a33a-9864892bec7e',
    method: 'transfer',
    methodType: 'actions',
    protocol: 'ERC1155',
    params: [
      {
        key: 'to',
        value: '0xba232b47a7ddfccc221916cf08da03a4973d3a1d',
      },
      {
        key: 'methodParams.tokenId',
        value: {
          type: 'output',
          id: {
            innerIndex: 0,
            nodeId: 'f70d02d6-b486-4cf2-ae3a-9864892bec7e',
          },
        },
      },
      {
        key: 'methodParams.address',
        value: '0xba232b47a7ddfccc221916cf08da03a4973d3a1d',
      },
    ],
    outputs: [{key: 'balance'}],
  },
];
