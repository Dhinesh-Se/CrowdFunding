import Head from "next/head";
import NextLink from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useState } from "react";
import { getETHPrice, getETHPriceInUSD } from "../../../../lib/getETHPrice";
import { useWallet } from "../../../../lib/wallet";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import web3 from "../../../../smart-contract/web3";
import getCampaign from "../../../../smart-contract/campaign";
import { useAsync } from "react-use";

export default function NewRequest() {
  const router = useRouter();
  const { id } = router.query;
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({ mode: "onChange" });
  const [error, setError] = useState("");
  const [inUSD, setInUSD] = useState();
  const [ETHPrice, setETHPrice] = useState(0);
  const wallet = useWallet();

  useAsync(async () => {
    try {
      const result = await getETHPrice();
      setETHPrice(result || 0);
    } catch (priceError) {
      console.error(priceError);
    }
  }, []);

  async function onSubmit(data) {
    setError("");

    try {
      const account = wallet.account || (await wallet.connect());
      const campaign = getCampaign(id);
      await campaign.methods
        .createRequest(
          data.description,
          web3.utils.toWei(data.value, "ether"),
          data.recipient
        )
        .send({ from: account, gas: "5000000" });

      router.push(`/campaign/${id}/requests`);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }

  return (
    <div>
      <Head>
        <title>Create a Withdrawal Request</title>
        <meta name="description" content="Create a Withdrawal Request" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <main>
        <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6}>
          <Text fontSize={"lg"} color={"teal.400"} justifyContent="center">
            <Box as={FiArrowLeft} display="inline" mr={2} />
            <NextLink href={`/campaign/${id}/requests`}>Back to Requests</NextLink>
          </Text>
          <Stack>
            <Heading fontSize={"4xl"}>Create a Withdrawal Request 💸</Heading>
          </Stack>
          <Box rounded={"lg"} bg={useColorModeValue("white", "gray.700")} boxShadow={"lg"} p={8}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl id="description">
                  <FormLabel>Request Description</FormLabel>
                  <Textarea {...register("description", { required: true })} isDisabled={isSubmitting} />
                </FormControl>
                <FormControl id="value">
                  <FormLabel>Amount in Ether</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      {...register("value", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => setInUSD(Math.abs(e.target.value))}
                      step="any"
                      min="0"
                    />
                    <InputRightAddon>ETH</InputRightAddon>
                  </InputGroup>
                  {inUSD ? <FormHelperText>~$ {getETHPriceInUSD(ETHPrice, inUSD)}</FormHelperText> : null}
                </FormControl>
                <FormControl id="recipient">
                  <FormLabel htmlFor="recipient">Recipient Ethereum Wallet Address</FormLabel>
                  <Input
                    {...register("recipient", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                {errors.description || errors.value || errors.recipient ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>All fields are required.</AlertDescription>
                  </Alert>
                ) : null}
                {error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                <Stack spacing={4}>
                  <Button
                    bg={"teal.400"}
                    color={"white"}
                    _hover={{ bg: "teal.500" }}
                    isLoading={isSubmitting || wallet.status === "connecting"}
                    type="submit"
                  >
                    {wallet.status === "connected" ? "Create Withdrawal Request" : "Connect Wallet & Create Request"}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </main>
    </div>
  );
}
