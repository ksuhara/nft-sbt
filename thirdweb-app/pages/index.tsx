import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractWrite,
} from "@thirdweb-dev/react";
import { Text, Button, Box, Flex, Image } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const address = useAddress();
  const { contract, isLoading, error } = useContract(
    "0x1C6512c148CF6f59e81c7ee929D41BCA2aCe9e97"
  );
  const { mutateAsync: claim, isLoading: isContractWriteLoading } =
    useContractWrite(contract, "claimSBTorNFT");

  const [metadata, setMetadata] = useState<any>(undefined);
  const [supply, setSupply] = useState<any>({
    unclaimedSupply: 0,
    totalSupply: 0,
  });

  const handleClaim = async (_isSBT: boolean) => {
    try {
      const data = await claim([
        _isSBT,
        {
          value: _isSBT
            ? ethers.utils.parseEther("0.01")
            : ethers.utils.parseEther("0.02"),
        },
      ]);
      console.info("contract call successs", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  useEffect(() => {
    const syncData = async () => {
      const fetchedMetadata = await contract?.metadata.get();
      if (!fetchedMetadata) return;
      console.log(fetchedMetadata);
      setMetadata(fetchedMetadata);
      const claimed = await contract?.erc721.totalClaimedSupply();
      const unclaimed = await contract?.erc721.totalUnclaimedSupply();
      console.log(unclaimed, "unclaimed");
      if (!claimed || !unclaimed) return;
      setSupply({
        unclaimedSupply: unclaimed.toNumber(),
        totalSupply: claimed.toNumber() + unclaimed.toNumber(),
      });
    };
    syncData();
  }, [contract]);

  return (
    <div>
      {address ? (
        <>
          <Text>connected:{address}</Text>
          <Image src={metadata?.image} alt=""></Image>
          <Flex width={"3xl"}>
            <Button
              colorScheme={"blue"}
              width="full"
              mx="2"
              onClick={() => handleClaim(true)}
            >
              SBT 0.01ETH
            </Button>
            <Button
              colorScheme={"red"}
              width="full"
              mx="2"
              onClick={() => handleClaim(false)}
            >
              NFT 0.02ETH
            </Button>
          </Flex>
          <Text>
            在庫：{supply?.unclaimedSupply} / {supply?.totalSupply}
          </Text>
        </>
      ) : (
        <ConnectWallet />
      )}
    </div>
  );
};

export default Home;
