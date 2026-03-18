import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import NextLink from "next/link";
import DarkModeSwitch from "./DarkModeSwitch";
import { useWallet } from "../lib/wallet";

export default function NavBar() {
  const wallet = useWallet();

  const handleConnect = async () => {
    try {
      await wallet.connect();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Flex
        color={useColorModeValue("gray.600", "white")}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align={"center"}
        pos="fixed"
        top="0"
        w={"full"}
        minH={"60px"}
        boxShadow={"sm"}
        zIndex="999"
        justify={"center"}
        css={{
          backdropFilter: "saturate(180%) blur(5px)",
          backgroundColor: useColorModeValue(
            "rgba(255, 255, 255, 0.8)",
            "rgba(26, 32, 44, 0.8)"
          ),
        }}
      >
        <Container as={Flex} maxW={"7xl"} align={"center"}>
          <Flex flex={{ base: 1 }} justify="start" ml={{ base: -2, md: 0 }}>
            <Heading
              textAlign="left"
              fontFamily={"heading"}
              color={useColorModeValue("teal.800", "white")}
              as="h2"
              size="lg"
            >
              <Box
                as={"span"}
                color={useColorModeValue("teal.400", "teal.300")}
                position={"relative"}
                zIndex={10}
                _after={{
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  w: "full",
                  h: "30%",
                  bg: useColorModeValue("teal.100", "teal.900"),
                  zIndex: -1,
                }}
              >
                <NextLink href="/">🤝Fund Raiser</NextLink>
              </Box>
            </Heading>
          </Flex>
          <Stack
            flex={{ base: 1, md: 0 }}
            justify={"flex-end"}
            direction={"row"}
            spacing={6}
            display={{ base: "none", md: "flex" }}
            align="center"
          >
            <Button fontSize={"md"} fontWeight={600} variant={"link"}>
              <NextLink href="/campaign/new">Create Campaign</NextLink>
            </Button>
            <Button fontSize={"md"} fontWeight={600} variant={"link"}>
              <NextLink href="/#howitworks">How it Works</NextLink>
            </Button>

            {wallet.status === "connected" ? (
              <Menu>
                <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                  {wallet.account.slice(0, 10)}...
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={wallet.disconnect}>Disconnect Wallet</MenuItem>
                  <MenuItem isDisabled>
                    <Text fontSize="sm">Chain: {wallet.chainId || "unknown"}</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                display={{ base: "none", md: "inline-flex" }}
                fontSize={"md"}
                fontWeight={600}
                color={"white"}
                bg={"teal.400"}
                _hover={{ bg: "teal.300" }}
                onClick={handleConnect}
                isLoading={wallet.status === "connecting"}
              >
                Connect Wallet
              </Button>
            )}

            <DarkModeSwitch />
          </Stack>

          <Flex display={{ base: "flex", md: "none" }}>
            <DarkModeSwitch />
          </Flex>
        </Container>
      </Flex>
      {wallet.error ? (
        <Container maxW="7xl" pt="72px">
          <Alert status="warning" rounded="md">
            <AlertIcon />
            <AlertDescription>{wallet.error}</AlertDescription>
          </Alert>
        </Container>
      ) : null}
    </Box>
  );
}
