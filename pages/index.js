import Head from "next/head";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import styles from "../styles/Home.module.css";
import { getETHPrice, getWEIPriceInUSD } from "../lib/getETHPrice";
import { getFactory } from "../smart-contract/factory";
import getCampaign from "../smart-contract/campaign";
import web3 from "../smart-contract/web3";
import { FACTORY_ADDRESS, isBlockchainConfigured } from "../lib/blockchain";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  chakra,
  Code,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Img,
  ListItem,
  OrderedList,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaBolt,
  FaCoins,
  FaHandshake,
  FaLayerGroup,
  FaRocket,
  FaShieldAlt,
} from "react-icons/fa";

const deploymentHighlights = [
  {
    title: "Sepolia-ready",
    text: "Use Sepolia instead of old Rinkeby flows for hosted deployments.",
    icon: FaRocket,
  },
  {
    title: "Wallet approvals",
    text: "Contributors approve payout requests before the manager finalizes them.",
    icon: FaShieldAlt,
  },
  {
    title: "Portable hosting",
    text: "Works on localhost, Vercel, or Netlify with the same env-based contract settings.",
    icon: FaLayerGroup,
  },
];

const hostingCards = [
  {
    title: "RPC provider",
    value: "Alchemy / Infura / QuickNode / Ankr",
    text: "Create a Sepolia app/project in your provider dashboard, then copy the HTTPS endpoint as NEXT_PUBLIC_RPC_URL and DEPLOY_RPC_URL.",
  },
  {
    title: "Contract address",
    value: "factoryAddress",
    text: "Run npm run contracts:deploy. The deploy script writes smart-contract/deployment.json. Use its factoryAddress value as NEXT_PUBLIC_FACTORY_ADDRESS for hosted builds.",
  },
  {
    title: "Explorer",
    value: "Sepolia Etherscan",
    text: "Set NEXT_PUBLIC_BLOCK_EXPLORER_ADDRESS_URL to https://sepolia.etherscan.io/address so the UI links to your deployed contracts and recipient accounts.",
  },
];

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
        bg={useColorModeValue("rgba(255,255,255,0.86)", "gray.800")}
        backdropFilter="blur(12px)"
        borderWidth="1px"
        borderColor={useColorModeValue("whiteAlpha.800", "whiteAlpha.200")}
        rounded="3xl"
        shadow="xl"
        overflow="hidden"
        cursor="pointer"
        transition={"all 0.3s ease"}
        _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
      >
        <Box height="18em" bg="gray.100">
          <Img
            src={imageURL}
            alt={`Picture of ${name}`}
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
                <Icon as={FaHandshake} h={7} w={7} alignSelf={"center"} color={"brand.500"} />
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
                rounded="full"
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
          campaigns.map((campaignAddress) =>
            getCampaign(campaignAddress).methods.getSummary().call()
          )
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
        <title>BetterFund</title>
        <meta
          name="description"
          content="Modern on-chain crowdfunding for local and hosted deployments"
        />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <main className={styles.main}>
        <Container py={{ base: "6", md: "14" }} maxW={"7xl"} align={"left"}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1.35fr 0.95fr" }}
            gap={{ base: 8, lg: 10 }}
            alignItems="stretch"
          >
            <GridItem>
              <Stack
                spacing={6}
                bg={useColorModeValue("rgba(255,255,255,0.72)", "gray.800")}
                backdropFilter="blur(12px)"
                borderWidth="1px"
                borderColor={useColorModeValue("whiteAlpha.700", "whiteAlpha.200")}
                rounded="3xl"
                p={{ base: 6, md: 10 }}
                shadow="xl"
              >
                <Badge alignSelf="flex-start" colorScheme="purple" px={3} py={1} rounded="full">
                  Web3 crowdfunding • modernized workflow
                </Badge>
                <Heading
                  textAlign={useBreakpointValue({ base: "left" })}
                  fontFamily={"heading"}
                  color={useColorModeValue("gray.800", "white")}
                  as="h1"
                  lineHeight="1.05"
                  fontSize={{ base: "4xl", md: "6xl" }}
                >
                  Launch beautiful crypto fundraisers with safer approvals.
                </Heading>
                <Text fontSize={{ base: "lg", md: "xl" }} color={useColorModeValue("gray.600", "gray.300")}>
                  BetterFund lets campaign creators raise ETH, contributors approve payout requests, and teams deploy the same app locally or on Vercel/Netlify with environment-based configuration.
                </Text>
                <HStack flexWrap="wrap" spacing={4}>
                  <NextLink href="/campaign/new">
                    <Button
                      size="lg"
                      color={"white"}
                      bgGradient="linear(to-r, brand.500, accent.500)"
                      _hover={{ bgGradient: "linear(to-r, brand.600, accent.600)" }}
                      rounded="full"
                    >
                      Launch Campaign
                    </Button>
                  </NextLink>
                  <NextLink href="/#deploy">
                    <Button size="lg" variant="outline" colorScheme="purple" rounded="full">
                      Hosting Setup Guide
                    </Button>
                  </NextLink>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Stat bg={useColorModeValue("whiteAlpha.800", "whiteAlpha.100")} rounded="2xl" p={4}>
                    <StatLabel>Contract source</StatLabel>
                    <StatNumber fontSize="2xl">Solidity 0.8.x</StatNumber>
                  </Stat>
                  <Stat bg={useColorModeValue("whiteAlpha.800", "whiteAlpha.100")} rounded="2xl" p={4}>
                    <StatLabel>Suggested hosted network</StatLabel>
                    <StatNumber fontSize="2xl">Sepolia</StatNumber>
                  </Stat>
                  <Stat bg={useColorModeValue("whiteAlpha.800", "whiteAlpha.100")} rounded="2xl" p={4}>
                    <StatLabel>Current factory</StatLabel>
                    <StatNumber fontSize="lg" noOfLines={1}>{FACTORY_ADDRESS || "Not configured yet"}</StatNumber>
                  </Stat>
                </SimpleGrid>
              </Stack>
            </GridItem>
            <GridItem>
              <SimpleGrid columns={1} spacing={4} h="full">
                {deploymentHighlights.map((item) => (
                  <Box key={item.title} bg={useColorModeValue("rgba(255,255,255,0.76)", "gray.800")} backdropFilter="blur(12px)" rounded="3xl" p={6} borderWidth="1px" borderColor={useColorModeValue("whiteAlpha.800", "whiteAlpha.200")} shadow="lg">
                    <HStack align="start" spacing={4}>
                      <Flex w={12} h={12} rounded="2xl" align="center" justify="center" bgGradient="linear(to-br, brand.500, accent.500)" color="white">
                        <Icon as={item.icon} />
                      </Flex>
                      <Box>
                        <Heading size="md" mb={2}>{item.title}</Heading>
                        <Text color={useColorModeValue("gray.600", "gray.300")}>{item.text}</Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </GridItem>
          </Grid>

          {blockchainError ? (
            <Alert status="warning" mt={8} mb={6} rounded="2xl" alignItems="start" borderWidth="1px" borderColor="orange.200">
              <AlertIcon mt="1" />
              <AlertDescription>
                <Text fontWeight="bold" mb={2}>{blockchainError}</Text>
                <OrderedList spacing={2} pl={4}>
                  <ListItem>For localhost, start Ganache or another local chain and run <Code>npm run contracts:deploy</Code>.</ListItem>
                  <ListItem>For Vercel/Netlify, deploy the factory to Sepolia first, then set <Code>NEXT_PUBLIC_RPC_URL</Code> and <Code>NEXT_PUBLIC_FACTORY_ADDRESS</Code> in the hosting dashboard.</ListItem>
                  <ListItem>Open <Code>smart-contract/deployment.json</Code> and copy the <Code>factoryAddress</Code> value if you want to set it manually.</ListItem>
                  <ListItem>Also set <Code>NEXT_PUBLIC_BLOCK_EXPLORER_ADDRESS_URL=https://sepolia.etherscan.io/address</Code>.</ListItem>
                  <ListItem>Restart or redeploy the app after updating environment variables.</ListItem>
                </OrderedList>
                <Text mt={3}>
                  Local development can auto-read <Code>smart-contract/deployment.json</Code>. Hosted builds cannot, so Vercel/Netlify should always receive explicit environment variables.
                </Text>
              </AlertDescription>
            </Alert>
          ) : null}

          <Box id="howitworks" mt={12}>
            <Heading mb={6}>How it works</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Box rounded="3xl" bg={useColorModeValue("rgba(255,255,255,0.82)", "gray.800")} p={6} borderWidth="1px" shadow="md">
                <Icon as={FaRocket} boxSize={8} color="brand.500" mb={4} />
                <Heading size="md" mb={3}>1. Launch</Heading>
                <Text>Create a campaign with a minimum contribution, image, story, and target amount.</Text>
              </Box>
              <Box rounded="3xl" bg={useColorModeValue("rgba(255,255,255,0.82)", "gray.800")} p={6} borderWidth="1px" shadow="md">
                <Icon as={FaCoins} boxSize={8} color="accent.500" mb={4} />
                <Heading size="md" mb={3}>2. Fund</Heading>
                <Text>Backers contribute ETH directly from their wallet and become approvers for spending requests.</Text>
              </Box>
              <Box rounded="3xl" bg={useColorModeValue("rgba(255,255,255,0.82)", "gray.800")} p={6} borderWidth="1px" shadow="md">
                <Icon as={FaBolt} boxSize={8} color="orange.400" mb={4} />
                <Heading size="md" mb={3}>3. Approve & finalize</Heading>
                <Text>Campaign managers create payout requests, contributors approve them, and the manager finalizes once the threshold is reached.</Text>
              </Box>
            </SimpleGrid>
          </Box>

          <Box id="deploy" mt={14}>
            <Heading mb={6}>Deploy on Vercel or Netlify</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {hostingCards.map((card) => (
                <Box key={card.title} rounded="3xl" bg={useColorModeValue("rgba(255,255,255,0.82)", "gray.800")} p={6} borderWidth="1px" shadow="md">
                  <Text fontSize="sm" color="gray.500" mb={2}>{card.title}</Text>
                  <Heading size="md" mb={3}>{card.value}</Heading>
                  <Text color={useColorModeValue("gray.600", "gray.300")}>{card.text}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Box mt={14}>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} mb={6} gap={4}>
              <Box>
                <Heading>Active campaigns</Heading>
                <Text color={useColorModeValue("gray.600", "gray.300")}>Explore what the community is funding right now.</Text>
              </Box>
              <NextLink href="/campaign/new">
                <Button colorScheme="purple" variant="outline" rounded="full">Create your own</Button>
              </NextLink>
            </Flex>

            {loading ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} height="28rem" rounded="3xl" />
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
              <Box rounded="3xl" borderWidth="1px" p={10} textAlign="center" bg={useColorModeValue("rgba(255,255,255,0.82)", "gray.800")}>
                <Heading size="md" mb={4}>No campaigns yet</Heading>
                <Text mb={6}>Be the first to launch a campaign after your wallet is connected.</Text>
                <HStack justify="center">
                  <NextLink href="/campaign/new">
                    <Button color={"white"} bgGradient="linear(to-r, brand.500, accent.500)">Start a campaign</Button>
                  </NextLink>
                </HStack>
              </Box>
            ) : null}
          </Box>
        </Container>
      </main>
    </div>
  );
}
