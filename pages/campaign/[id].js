import Head from "next/head";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useWindowSize } from "react-use";
import {
  getETHPrice,
  getETHPriceInUSD,
  getWEIPriceInUSD,
} from "../../lib/getETHPrice";
import { getAddressExplorerUrl } from "../../lib/blockchain";
import { useWallet } from "../../lib/wallet";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  CloseButton,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Link,
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiExternalLink, FiInfo } from "react-icons/fi";
import NextLink from "next/link";
import Confetti from "react-confetti";

import web3 from "../../smart-contract/web3";
import getCampaign from "../../smart-contract/campaign";

export async function getServerSideProps({ params }) {
  const campaignId = params.id;
  const campaign = getCampaign(campaignId);
  const summary = await campaign.methods.getSummary().call();
  const ETHPrice = await getETHPrice();

  return {
    props: {
      id: campaignId,
      minimumContribution: summary[0],
      balance: summary[1],
      requestsCount: summary[2],
      approversCount: summary[3],
      manager: summary[4],
      name: summary[5],
      description: summary[6],
      image: summary[7],
      target: summary[8],
      ETHPrice: ETHPrice || 0,
    },
  };
}

function StatsCard({ title, stat, info }) {
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"sm"}
      border={"1px solid"}
      borderColor={"gray.500"}
      rounded={"lg"}
      transition={"transform 0.3s ease"}
      _hover={{ transform: "translateY(-5px)" }}
    >
      <Tooltip
        label={info}
        bg={useColorModeValue("white", "gray.700")}
        placement={"top"}
        color={useColorModeValue("gray.800", "white")}
        fontSize={"1em"}
      >
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={"medium"} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={"base"} fontWeight={"bold"} isTruncated maxW={{ base: "10rem", sm: "sm" }}>
            {stat}
          </StatNumber>
        </Box>
      </Tooltip>
    </Stat>
  );
}

export default function CampaignSingle({
  id,
  minimumContribution,
  balance,
  requestsCount,
  approversCount,
  manager,
  name,
  description,
  image,
  target,
  ETHPrice,
}) {
  const { handleSubmit, register, formState, reset } = useForm({ mode: "onChange" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [amountInUSD, setAmountInUSD] = useState();
  const wallet = useWallet();
  const router = useRouter();
  const { width, height } = useWindowSize();

  async function onSubmit(data) {
    setError("");

    try {
      const account = wallet.account || (await wallet.connect());
      const campaign = getCampaign(id);
      await campaign.methods.contibute().send({
        from: account,
        value: web3.utils.toWei(data.value, "ether"),
        gas: "5000000",
      });
      reset();
      setAmountInUSD(null);
      setIsSubmitted(true);
      router.replace(`/campaign/${id}`);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }

  const explorerUrl = getAddressExplorerUrl(id);

  return (
    <div>
      <Head>
        <title>Campaign Details</title>
        <meta name="description" content="Create a Withdrawal Request" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      {isSubmitted ? <Confetti width={width} height={height} /> : null}
      <main>
        <Box position={"relative"}>
          {isSubmitted ? (
            <Container maxW={"7xl"} py={{ base: 6 }}>
              <Alert status="success" mt="2">
                <AlertIcon />
                <AlertDescription mr={2}>Thank you for your contribution 🙏</AlertDescription>
                <CloseButton position="absolute" right="8px" top="8px" onClick={() => setIsSubmitted(false)} />
              </Alert>
            </Container>
          ) : null}
          <Container as={SimpleGrid} maxW={"7xl"} columns={{ base: 1, md: 2 }} spacing={{ base: 10, lg: 32 }} py={{ base: 6 }}>
            <Stack spacing={{ base: 6 }}>
              <Heading lineHeight={1.1} fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}>
                {name}
              </Heading>
              <Text color={useColorModeValue("gray.500", "gray.200")} fontSize={{ base: "lg" }}>
                {description}
              </Text>
              {image ? (
                <Box as="img" src={image} alt={name} rounded="xl" objectFit="cover" maxH="360px" w="full" />
              ) : null}
              {explorerUrl ? (
                <Link color="teal.500" href={explorerUrl} isExternal>
                  View contract on explorer <Box as={FiExternalLink} mx="2px" display="inline" />
                </Link>
              ) : null}
              <Box mx={"auto"} w={"full"}>
                <SimpleGrid columns={{ base: 1 }} spacing={{ base: 5 }}>
                  <StatsCard
                    title={"Minimum Contribution"}
                    stat={`${web3.utils.fromWei(minimumContribution, "ether")} ETH${ETHPrice ? ` ($${getWEIPriceInUSD(ETHPrice, minimumContribution)})` : ""}`}
                    info={"You must contribute at least this much to become an approver."}
                  />
                  <StatsCard title={"Wallet Address of Campaign Creator"} stat={manager} info={"The campaign creator can create and finalize withdrawal requests."} />
                  <StatsCard title={"Number of Requests"} stat={requestsCount} info={"Each request is a proposed withdrawal from the campaign balance."} />
                  <StatsCard title={"Number of Approvers"} stat={approversCount} info={"Contributors become approvers and can vote on withdrawal requests."} />
                </SimpleGrid>
              </Box>
            </Stack>
            <Stack spacing={{ base: 4 }}>
              <Box>
                <Stat bg={useColorModeValue("white", "gray.700")} boxShadow={"lg"} rounded={"xl"} p={{ base: 4, sm: 6, md: 8 }}>
                  <StatLabel fontWeight={"medium"}>
                    <Text as="span" isTruncated mr={2}>Campaign Balance</Text>
                    <Tooltip
                      label="The balance is how much money this campaign still has available."
                      bg={useColorModeValue("white", "gray.700")}
                      placement={"top"}
                      color={useColorModeValue("gray.800", "white")}
                      fontSize={"1em"}
                      px="4"
                    >
                      <Box as={FiInfo} color={useColorModeValue("teal.800", "white")} display="inline" />
                    </Tooltip>
                  </StatLabel>
                  <StatNumber>
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
                        display={balance > 0 && ETHPrice ? "inline" : "none"}
                        fontWeight={"normal"}
                        color={useColorModeValue("gray.500", "gray.200")}
                      >
                        (${getWEIPriceInUSD(ETHPrice, balance)})
                      </Text>
                    </Box>
                    <Text fontSize={"md"} fontWeight="normal">
                      target of {web3.utils.fromWei(target, "ether")} ETH{ETHPrice ? ` ($${getWEIPriceInUSD(ETHPrice, target)})` : ""}
                    </Text>
                    <Progress
                      colorScheme="teal"
                      size="sm"
                      value={Number(web3.utils.fromWei(balance, "ether"))}
                      max={Number(web3.utils.fromWei(target, "ether")) || 1}
                      mt={4}
                    />
                  </StatNumber>
                </Stat>
              </Box>
              <Stack bg={useColorModeValue("white", "gray.700")} boxShadow={"lg"} rounded={"xl"} p={{ base: 4, sm: 6, md: 8 }} spacing={{ base: 6 }}>
                <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }} color={useColorModeValue("teal.600", "teal.200")}>
                  Contribute Now!
                </Heading>
                <Box mt={10}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl id="value">
                      <FormLabel>Amount in Ether you want to contribute</FormLabel>
                      <InputGroup>
                        <Input
                          {...register("value", { required: true })}
                          type="number"
                          isDisabled={formState.isSubmitting}
                          onChange={(e) => setAmountInUSD(Math.abs(e.target.value))}
                          step="any"
                          min="0"
                        />
                        <InputRightAddon>ETH</InputRightAddon>
                      </InputGroup>
                      {amountInUSD ? (
                        <FormHelperText>~$ {getETHPriceInUSD(ETHPrice, amountInUSD)}</FormHelperText>
                      ) : null}
                    </FormControl>
                    {error ? (
                      <Alert status="error" mt="2">
                        <AlertIcon />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : null}
                    <Stack spacing={4}>
                      <Button
                        fontFamily={"heading"}
                        mt={4}
                        w={"full"}
                        bgGradient="linear(to-r, teal.400,green.400)"
                        color={"white"}
                        _hover={{ bgGradient: "linear(to-r, teal.400,blue.400)", boxShadow: "xl" }}
                        isLoading={formState.isSubmitting || wallet.status === "connecting"}
                        isDisabled={!amountInUSD}
                        type="submit"
                      >
                        {wallet.status === "connected" ? "Contribute" : "Connect Wallet & Contribute"}
                      </Button>
                    </Stack>
                  </form>
                </Box>
              </Stack>
              <Stack bg={useColorModeValue("white", "gray.700")} boxShadow={"lg"} rounded={"xl"} p={{ base: 4, sm: 6, md: 8 }} spacing={4}>
                <NextLink href={`/campaign/${id}/requests`}>
                  <Button fontFamily={"heading"} w={"full"} bgGradient="linear(to-r, teal.400,green.400)" color={"white"} _hover={{ bgGradient: "linear(to-r, teal.400,blue.400)", boxShadow: "xl" }}>
                    View Withdrawal Requests
                  </Button>
                </NextLink>
                <Text fontSize={"sm"}>
                  Contributors can approve withdrawal requests before the campaign manager finalizes them.
                </Text>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </main>
    </div>
  );
}
