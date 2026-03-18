import Head from "next/head";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import styles from "../styles/Home.module.css";
import { getETHPrice, getWEIPriceInUSD } from "../lib/getETHPrice";
import { getFactory } from "../smart-contract/factory";
import getCampaign from "../smart-contract/campaign";
import web3 from "../smart-contract/web3";
import { isBlockchainConfigured } from "../lib/blockchain";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  chakra,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Img,
  Progress,
  Skeleton,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaHandshake } from "react-icons/fa";

export async function getServerSideProps() {
  if (!isBlockchainConfigured) {
    return {
      props: {
        campaigns: [],
        blockchainError:
          "NEXT_PUBLIC_FACTORY_ADDRESS is not configured. Deploy the contracts and add the address to your environment.",
      },
    };
  }

  try {
    const campaigns = await getFactory().methods.getDeployedCampaigns().call();
    return {
      props: { campaigns, blockchainError: "" },
    };
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return {
      props: {
        campaigns: [],
        blockchainError:
          error.message ||
          "Unable to connect to the factory contract. Verify your RPC URL and factory address.",
      },
    };
  }
}

function CampaignCard({
  name,
  creatorId,
  imageURL,
  id,
  balance,
  target,
  ethPrice,
}) {
  return (
    <NextLink href={`/campaign/${id}`}>
      <Box
        bg={useColorModeValue("white", "gray.800")}
        maxW={{ md: "sm" }}
        borderWidth="1px"
        rounded="lg"
        shadow="lg"
        position="relative"
        cursor="pointer"
        transition={"transform 0.3s ease"}
        _hover={{ transform: "translateY(-8px)" }}
      >
        <Box height="18em">
          <Img
            src={imageURL}
            alt={`Picture of ${name}`}
            roundedTop="lg"
            objectFit="cover"
            w="full"
            h="full"
            display="block"
          />
        </Box>
        <Box p="6">
          <Flex mt="1" justifyContent="space-between" alignContent="center" py={2}>
            <Box fontSize="2xl" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
              {name}
            </Box>
            <Tooltip
              label="Contribute"
              bg={useColorModeValue("white", "gray.700")}
              placement={"top"}
              color={useColorModeValue("gray.800", "white")}
              fontSize={"1.2em"}
            >
              <chakra.a display={"flex"}>
                <Icon as={FaHandshake} h={7} w={7} alignSelf={"center"} color={"teal.400"} />
              </chakra.a>
            </Tooltip>
          </Flex>
          <Flex alignContent="center" py={2}>
            <Text color={"gray.500"} pr={2}>
              by
            </Text>
            <Heading size="base" isTruncated>
              {creatorId}
            </Heading>
          </Flex>
          <Flex direction="row" py={2}>
            <Box w="full">
              <Box fontSize={"2xl"} isTruncated maxW={{ base: "15rem", sm: "sm" }} pt="2">
                <Text as="span" fontWeight={"bold"}>
                  {balance > 0 ? web3.utils.fromWei(balance, "ether") : "0, Become a Donor 😄"}
                </Text>
                <Text as="span" display={balance > 0 ? "inline" : "none"} pr={2} fontWeight={"bold"}>
                  ETH
                </Text>
                <Text
                  as="span"
                  fontSize="lg"
                  display={balance > 0 && ethPrice ? "inline" : "none"}
                  fontWeight={"normal"}
                  color={useColorModeValue("gray.500", "gray.200")}
                >
                  (${getWEIPriceInUSD(ethPrice, balance)})
                </Text>
              </Box>
              <Text fontSize={"md"} fontWeight="normal">
                target of {web3.utils.fromWei(target, "ether")} ETH
                {ethPrice ? ` ($${getWEIPriceInUSD(ethPrice, target)})` : ""}
              </Text>
              <Progress
                colorScheme="teal"
                size="sm"
                value={Number(web3.utils.fromWei(balance, "ether"))}
                max={Number(web3.utils.fromWei(target, "ether")) || 1}
                mt="2"
              />
            </Box>
          </Flex>
        </Box>
      </Box>
    </NextLink>
  );
}

export default function Home({ campaigns, blockchainError }) {
  const [campaignList, setCampaignList] = useState([]);
  const [ethPrice, updateEthPrice] = useState(null);
  const [loading, setLoading] = useState(Boolean(campaigns.length));

  useEffect(() => {
    let ignore = false;

    async function getSummary() {
      if (!campaigns.length) {
        setLoading(false);
        return;
      }

      try {
        const summary = await Promise.all(
          campaigns.map((campaignAddress) => getCampaign(campaignAddress).methods.getSummary().call())
        );
        const price = await getETHPrice();

        if (!ignore) {
          updateEthPrice(price);
          setCampaignList(summary);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    getSummary();

    return () => {
      ignore = true;
    };
  }, [campaigns]);

  return (
    <div>
      <Head>
        <title>Fund Raiser</title>
        <meta name="description" content="Transparent Crowdfunding in Blockchain" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <main className={styles.main}>
        <Container py={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
          <Heading
            textAlign={useBreakpointValue({ base: "left" })}
            fontFamily={"heading"}
            color={useColorModeValue("gray.800", "white")}
            as="h1"
            py={4}
          >
            Crowdfunding using Crypto & Blockchain
          </Heading>
          <Text mb={4} color={useColorModeValue("gray.600", "gray.300")}>Deploy the factory contract, add the environment variables, connect a wallet, and you can create campaigns, contribute, approve requests, and finalize payouts end to end.</Text>
          {blockchainError ? (
            <Alert status="warning" mb={6} rounded="md">
              <AlertIcon />
              <AlertDescription>{blockchainError}</AlertDescription>
            </Alert>
          ) : null}
          <NextLink href="/campaign/new">
            <Button display={{ sm: "inline-flex" }} fontSize={"md"} fontWeight={600} color={"white"} bg={"teal.400"} _hover={{ bg: "teal.300" }} mb={8}>
              Create Campaign
            </Button>
          </NextLink>

          <Stack id="howitworks" spacing={4} mb={10}>
            <Heading size="md">How it works</Heading>
            <Text>1. A manager deploys the contracts and sets the factory address in the app.</Text>
            <Text>2. Any connected wallet can create a campaign and fund it.</Text>
            <Text>3. Contributors approve withdrawal requests before the manager finalizes them.</Text>
          </Stack>

          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} height="28rem" rounded="lg" />
              ))}
            </SimpleGrid>
          ) : null}

          {!loading && campaignList.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {campaignList.map((campaign, index) => (
                <CampaignCard
                  key={campaigns[index]}
                  id={campaigns[index]}
                  balance={campaign[1]}
                  name={campaign[5]}
                  creatorId={campaign[4]}
                  imageURL={campaign[7]}
                  target={campaign[8]}
                  ethPrice={ethPrice}
                />
              ))}
            </SimpleGrid>
          ) : null}

          {!loading && !campaignList.length && !blockchainError ? (
            <Box rounded="lg" borderWidth="1px" p={8} textAlign="center">
              <Heading size="md" mb={4}>No campaigns yet</Heading>
              <Text mb={6}>Create the first campaign once your wallet is connected.</Text>
              <HStack justify="center">
                <NextLink href="/campaign/new">
                  <Button colorScheme="teal">Start a campaign</Button>
                </NextLink>
              </HStack>
            </Box>
          ) : null}
        </Container>
      </main>
    </div>
  );
}
