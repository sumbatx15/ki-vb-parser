import { ERC20, ERC721, ERC1155 } from "@kiroboio/fct-core";
import { create } from "@kiroboio/fct-builder";

const fct = create();

const erc20_balanceOf_0 = fct.add(ERC20.getters.balanceOf, {
  to: ["0xba232b47a7ddfccc221916cf08da03a4973d3a1d", undefined],
  methodParams: {
    owner: {
      first: "0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4",
      second: "0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4"
    }
  }
});

const erc20_simpleTransfer_1 = fct.add(ERC20.actions.simpleTransfer, {
  to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
  isVault: true,
  methodParams: {
    from: "0x7c5dB9172038F6748FDCac2528b07c9F98Dd8aa4",
    to: "0x683C0803F89308c4e05e14Dcfc51eCEBF7889f6c",
    amount: erc20_balanceOf_0.outputs.balance
  }
});

const erc721_transfer_2 = fct.add(ERC721.actions.transfer, {
  to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
  methodParams: {
    owner: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d"
  }
});

const erc1155_transfer_3 = fct.add(ERC1155.actions.transfer, {
  to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
  methodParams: {
    
    tokenId: erc721_transfer_2.outputs.balance,
    address: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d"
  }
});

fct.startWith(erc20_balanceOf_0.then(erc20_simpleTransfer_1).then(erc721_transfer_2).then(erc1155_transfer_3));