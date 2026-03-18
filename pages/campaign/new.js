import { useState } from "react";
import Head from "next/head";
import { useAsync } from "react-use";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
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
import NextLink from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { getETHPrice, getETHPriceInUSD } from "../../lib/getETHPrice";
import { useWallet } from "../../lib/wallet";
import { getFactory } from "../../smart-contract/factory";
import web3 from "../../smart-contract/web3";

export default function NewCampaign() {
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({ mode: "onChange" });
  const router = useRouter();
  const [error, setError] = useState("");
  const wallet = useWallet();
  const [minContriInUSD, setMinContriInUSD] = useState();
  const [targetInUSD, setTargetInUSD] = useState();
  const [ETHPrice, setETHPrice] = useState(0);

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
      await getFactory()
        .methods.createCampaign(
          web3.utils.toWei(data.minimumContribution, "ether"),
          data.campaignName,
          data.description,
          data.imageUrl,
          web3.utils.toWei(data.target, "ether")
        )
        .send({
          from: account,
          gas: "5000000",
        });

      router.push("/");
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }

  return (
    <div>
      <Head>
        <title>New Campaign</title>
        <meta name="description" content="Create New Campaign" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <main>
        <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6}>
          <Text fontSize={"lg"} color={"teal.400"}>
            <Box as={FiArrowLeft} display="inline" mr={2} />
            <NextLink href="/">Back to Home</NextLink>
          </Text>
          <Stack>
            <Heading fontSize={"4xl"}>Create a New Campaign 📢</Heading>
            <Text color={useColorModeValue("gray.600", "gray.300")}>
              This will create a new campaign from the deployed factory contract.
            </Text>
          </Stack>
          <Box rounded={"lg"} bg={useColorModeValue("white", "gray.700")} boxShadow={"lg"} p={8}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl id="minimumContribution">
                  <FormLabel>Minimum Contribution Amount</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      {...register("minimumContribution", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => setMinContriInUSD(Math.abs(e.target.value))}
                    />
                    <InputRightAddon>ETH</InputRightAddon>
                  </InputGroup>
                  {minContriInUSD ? (
                    <FormHelperText>~$ {getETHPriceInUSD(ETHPrice, minContriInUSD)}</FormHelperText>
                  ) : null}
                </FormControl>
                <FormControl id="campaignName">
                  <FormLabel>Campaign Name</FormLabel>
                  <Input {...register("campaignName", { required: true })} isDisabled={isSubmitting} />
                </FormControl>
                <FormControl id="description">
                  <FormLabel>Campaign Description</FormLabel>
                  <Textarea {...register("description", { required: true })} isDisabled={isSubmitting} />
                </FormControl>
                <FormControl id="imageUrl">
                  <FormLabel>Image URL</FormLabel>
                  <Input {...register("imageUrl", { required: true })} isDisabled={isSubmitting} type="url" />
                </FormControl>
                <FormControl id="target">
                  <FormLabel>Target Amount</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      {...register("target", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => setTargetInUSD(Math.abs(e.target.value))}
                    />
                    <InputRightAddon>ETH</InputRightAddon>
                  </InputGroup>
                  {targetInUSD ? (
                    <FormHelperText>~$ {getETHPriceInUSD(ETHPrice, targetInUSD)}</FormHelperText>
                  ) : null}
                </FormControl>

                {error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                {errors.minimumContribution || errors.campaignName || errors.description || errors.imageUrl || errors.target ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>All fields are required.</AlertDescription>
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
                    {wallet.status === "connected" ? "Create" : "Connect Wallet & Create"}
                  </Button>
                  {wallet.status !== "connected" ? (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        You will be prompted to connect your wallet before the transaction is sent.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </main>
    </div>
  );
}
