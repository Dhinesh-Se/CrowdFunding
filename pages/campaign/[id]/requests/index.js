import { useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { getETHPrice, getWEIPriceInUSD } from "../../../../lib/getETHPrice";
import { getAddressExplorerUrl } from "../../../../lib/blockchain";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Skeleton,
  Spacer,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiAlertTriangle, FiArrowLeft, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useWallet } from "../../../../lib/wallet";
import web3 from "../../../../smart-contract/web3";
import getCampaign from "../../../../smart-contract/campaign";

export async function getServerSideProps({ params }) {
  const campaignId = params.id;
  const campaign = getCampaign(campaignId);
  const requestCount = await campaign.methods.getRequestsCount().call();
  const approversCount = await campaign.methods.approversCount().call();
  const summary = await campaign.methods.getSummary().call();
  const ETHPrice = await getETHPrice();

  return {
    props: {
      campaignId,
      requestCount,
      approversCount,
      balance: summary[1],
      name: summary[5],
      ETHPrice: ETHPrice || 0,
    },
  };
}

function RequestRow({ id, request, approversCount, campaignId, disabled, ETHPrice }) {
  const router = useRouter();
  const wallet = useWallet();
  const readyToFinalize = Number(request.approvalCount) > Number(approversCount) / 2;
  const [errorMessageApprove, setErrorMessageApprove] = useState("");
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [errorMessageFinalize, setErrorMessageFinalize] = useState("");
  const [loadingFinalize, setLoadingFinalize] = useState(false);

  const onApprove = async () => {
    setLoadingApprove(true);
    setErrorMessageApprove("");
    try {
      const account = wallet.account || (await wallet.connect());
      const campaign = getCampaign(campaignId);
      await campaign.methods.approveRequest(id).send({
        from: account,
        gas: "5000000",
      });
      router.reload();
    } catch (err) {
      setErrorMessageApprove(err.message);
    } finally {
      setLoadingApprove(false);
    }
  };

  const onFinalize = async () => {
    setLoadingFinalize(true);
    setErrorMessageFinalize("");
    try {
      const account = wallet.account || (await wallet.connect());
      const campaign = getCampaign(campaignId);
      await campaign.methods.finalizeRequest(id).send({
        from: account,
        gas: "5000000",
      });
      router.reload();
    } catch (err) {
      setErrorMessageFinalize(err.message);
    } finally {
      setLoadingFinalize(false);
    }
  };

  const recipientExplorerUrl = getAddressExplorerUrl(request.recipient);

  return (
    <Tr
      bg={
        readyToFinalize && !request.complete
          ? useColorModeValue("teal.100", "teal.700")
          : useColorModeValue("gray.100", "gray.700")
      }
      opacity={request.complete ? "0.4" : "1"}
    >
      <Td>{id}</Td>
      <Td>{request.description}</Td>
      <Td isNumeric>
        {web3.utils.fromWei(request.value, "ether")} ETH
        {ETHPrice ? ` ($${getWEIPriceInUSD(ETHPrice, request.value)})` : ""}
      </Td>
      <Td>
        {recipientExplorerUrl ? (
          <Link color="teal.500" href={recipientExplorerUrl} isExternal>
            {request.recipient.substring(0, 10)}...
          </Link>
        ) : (
          `${request.recipient.substring(0, 10)}...`
        )}
      </Td>
      <Td>
        {request.approvalCount}/{approversCount}
      </Td>
      <Td>
        <HStack spacing={2}>
          <Tooltip label={errorMessageApprove} bg={useColorModeValue("white", "gray.700")} placement={"top"} color={useColorModeValue("gray.800", "white")} fontSize={"1em"}>
            <Box as={FiAlertTriangle} color={useColorModeValue("red.600", "red.300")} display={errorMessageApprove ? "inline-block" : "none"} />
          </Tooltip>
          {request.complete ? (
            <Tooltip label="This request has already been finalized." bg={useColorModeValue("white", "gray.700")} placement={"top"} color={useColorModeValue("gray.800", "white")} fontSize={"1em"}>
              <Box as={FiCheckCircle} color={useColorModeValue("green.600", "green.300")} display="inline" />
            </Tooltip>
          ) : (
            <Button
              colorScheme="yellow"
              variant="outline"
              _hover={{ bg: "yellow.600", color: "white" }}
              onClick={onApprove}
              isDisabled={disabled || Number(request.approvalCount) === Number(approversCount)}
              isLoading={loadingApprove}
            >
              Approve
            </Button>
          )}
        </HStack>
      </Td>
      <Td>
        <Tooltip label={errorMessageFinalize} bg={useColorModeValue("white", "gray.700")} placement={"top"} color={useColorModeValue("gray.800", "white")} fontSize={"1em"}>
          <Box as={FiAlertTriangle} color={useColorModeValue("red.600", "red.300")} display={errorMessageFinalize ? "inline-block" : "none"} mr="2" />
        </Tooltip>
        {request.complete ? (
          <Tooltip label="This request has already been finalized." bg={useColorModeValue("white", "gray.700")} placement={"top"} color={useColorModeValue("gray.800", "white")} fontSize={"1em"}>
            <Box as={FiCheckCircle} color={useColorModeValue("green.600", "green.300")} display="inline" />
          </Tooltip>
        ) : (
          <HStack spacing={2}>
            <Button
              colorScheme="green"
              variant="outline"
              _hover={{ bg: "green.600", color: "white" }}
              isDisabled={disabled || !readyToFinalize}
              onClick={onFinalize}
              isLoading={loadingFinalize}
            >
              Finalize
            </Button>
            <Tooltip label="This request is ready to be finalized because it has approval from more than 50% of approvers." bg={useColorModeValue("white", "gray.700")} placement={"top"} color={useColorModeValue("gray.800", "white")} fontSize={"1.2em"}>
              <Box as={FiInfo} color={useColorModeValue("teal.800", "white")} display={readyToFinalize ? "inline-block" : "none"} />
            </Tooltip>
          </HStack>
        )}
      </Td>
    </Tr>
  );
}

export default function Requests({ campaignId, requestCount, approversCount, balance, name, ETHPrice }) {
  const [requestsList, setRequestsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fundNotAvailable, setFundNotAvailable] = useState(false);

  useEffect(() => {
    let ignore = false;
    const campaign = getCampaign(campaignId);

    async function getRequests() {
      try {
        const requests = await Promise.all(
          Array.from({ length: Number(requestCount) }, (_, index) => campaign.methods.requests(index).call())
        );

        if (!ignore) {
          setRequestsList(requests);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    setFundNotAvailable(Number(balance) === 0);
    getRequests();

    return () => {
      ignore = true;
    };
  }, [balance, campaignId, requestCount]);

  return (
    <div>
      <Head>
        <title>Campaign Withdrawal Requests</title>
        <meta name="description" content="Create a Withdrawal Request" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <main>
        <Container px={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
          <Flex flexDirection={{ base: "column", md: "row" }} py={4}>
            <Box py="4">
              <Text fontSize={"lg"} color={"teal.400"}>
                <Box as={FiArrowLeft} display="inline" mr={2} />
                <NextLink href={`/campaign/${campaignId}`}>Back to Campaign</NextLink>
              </Text>
            </Box>
            <Spacer />
            <Box py="4">
              Campaign Balance:{" "}
              <Text as="span" fontWeight={"bold"} fontSize="lg">
                {balance > 0 ? web3.utils.fromWei(balance, "ether") : "0, Become a Donor 😄"}
              </Text>
              <Text as="span" display={balance > 0 ? "inline" : "none"} pr={2} fontWeight={"bold"} fontSize="lg">
                ETH
              </Text>
              <Text as="span" display={balance > 0 && ETHPrice ? "inline" : "none"} fontWeight={"normal"} color={useColorModeValue("gray.500", "gray.200")}>
                (${getWEIPriceInUSD(ETHPrice, balance)})
              </Text>
            </Box>
          </Flex>
          {fundNotAvailable ? (
            <Alert status="warning" my={4}>
              <AlertIcon />
              <AlertDescription>
                The current balance of the campaign is 0. Contributors must fund the campaign before requests can be finalized.
              </AlertDescription>
            </Alert>
          ) : null}
        </Container>
        {requestsList.length > 0 ? (
          <Container px={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
            <Flex flexDirection={{ base: "column", lg: "row" }} py={4}>
              <Box py="2" pr="2">
                <Heading textAlign={useBreakpointValue({ base: "left" })} fontFamily={"heading"} color={useColorModeValue("gray.800", "white")} as="h3" isTruncated maxW={"3xl"}>
                  Withdrawal Requests for {name} Campaign
                </Heading>
              </Box>
              <Spacer />
              <Box py="2">
                <NextLink href={`/campaign/${campaignId}/requests/new`}>
                  <Button display={{ sm: "inline-flex" }} justify={"flex-end"} fontSize={"md"} fontWeight={600} color={"white"} bg={"teal.400"} _hover={{ bg: "teal.300" }}>
                    Add Withdrawal Request
                  </Button>
                </NextLink>
              </Box>
            </Flex>
            <Box overflowX="auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th w="30%">Description</Th>
                    <Th isNumeric>Amount</Th>
                    <Th maxW="12%" isTruncated>Recipient Wallet Address</Th>
                    <Th>Approval Count</Th>
                    <Th>Approve</Th>
                    <Th>Finalize</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requestsList.map((request, index) => (
                    <RequestRow
                      key={index}
                      id={index}
                      request={request}
                      approversCount={approversCount}
                      campaignId={campaignId}
                      disabled={fundNotAvailable}
                      ETHPrice={ETHPrice}
                    />
                  ))}
                </Tbody>
                <TableCaption textAlign="left" ml="-2">
                  Found {requestCount} requests
                </TableCaption>
              </Table>
            </Box>
          </Container>
        ) : (
          <div>
            <Container px={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"} display={isLoading ? "block" : "none"}>
              <SimpleGrid rows={{ base: 3 }} spacing={2}>
                <Skeleton height="2rem" />
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
              </SimpleGrid>
            </Container>
            <Container maxW={"lg"} align={"center"} display={requestsList.length === 0 && !isLoading ? "block" : "none"}>
              <SimpleGrid row spacing={2} align="center">
                <Stack align="center">
                  <NextImage src="/static/no-requests.png" alt="no-request" width={150} height={150} />
                </Stack>
                <Heading textAlign={"center"} color={useColorModeValue("gray.800", "white")} as="h4" size="md">
                  No Requests yet for {name} Campaign
                </Heading>
                <Text textAlign={useBreakpointValue({ base: "center" })} color={useColorModeValue("gray.600", "gray.300")} fontSize="sm">
                  Create a withdrawal request to spend funds from the campaign.
                </Text>
                <Button fontSize={"md"} fontWeight={600} color={"white"} bg={"teal.400"} _hover={{ bg: "teal.300" }}>
                  <NextLink href={`/campaign/${campaignId}/requests/new`}>Create Withdrawal Request</NextLink>
                </Button>
                <Button fontSize={"md"} fontWeight={600} color={"white"} bg={"gray.400"} _hover={{ bg: "gray.300" }}>
                  <NextLink href={`/campaign/${campaignId}/`}>Go to Campaign</NextLink>
                </Button>
              </SimpleGrid>
            </Container>
          </div>
        )}
      </main>
    </div>
  );
}
