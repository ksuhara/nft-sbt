// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC721LazyMint.sol";

contract Contract is ERC721LazyMint {

    mapping(uint256 => bool) private tokenIdIsSBT;
    uint256 pricePerNFT;
    uint256 pricePerSBT;
    address recepientAddress;

    constructor(
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        address _recepientAddress,
        uint128 _royaltyBps,
        uint256 _pricePerNFT,
        uint256 _pricePerSBT
    )
        ERC721LazyMint(
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps
        )
    {
        pricePerNFT = _pricePerNFT;
        pricePerSBT = _pricePerSBT;
        recepientAddress = _recepientAddress;
    }


    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 tokenId,
        uint256 quantity
    ) internal virtual override(ERC721A) {
        if(!tokenIdIsSBT[tokenId] || from == address(0)){
            super._beforeTokenTransfers(from, to,tokenId, quantity);
        }else{
            revert("This token is Soulbound");
        }
    }

    function claimSBTorNFT(bool _isSBT)public payable{
        if(_isSBT){
            require(msg.value == pricePerSBT, "value must be same as mint price for SBT");
        }else{
            require(msg.value == pricePerNFT, "value must be same as mint price for NFT");
        }
        uint256 tokenId = totalSupply();
        _safeMint(msg.sender, 1);
        payable(recepientAddress).transfer(msg.value);
        tokenIdIsSBT[tokenId] = _isSBT;
        emit TokensClaimed(msg.sender, msg.sender, tokenId, 1);
    }

}