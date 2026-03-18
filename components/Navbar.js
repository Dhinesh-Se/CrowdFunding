import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
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
        color={useColorModeValue("gray.700", "white")}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("whiteAlpha.700", "gray.900")}
        align={"center"}
        pos="fixed"
        top="0"
        w={"full"}
        minH={"72px"}
        boxShadow={"sm"}
        zIndex="999"
        justify={"center"}
        css={{
          backdropFilter: "saturate(180%) blur(12px)",
          backgroundColor: useColorModeValue(
            "rgba(255, 255, 255, 0.76)",
            "rgba(17, 24, 39, 0.84)"
          ),
        }}
      >
        <Container as={Flex} maxW={"7xl"} align={"center"} justify="space-between">
          <Flex align="center" gap={3}>
            <Heading textAlign="left" fontFamily={"heading"} color={useColorModeValue("brand.700", "white")} as="h2" size="lg">
              <NextLink href="/">✨ BetterFund</NextLink>
            </Heading>
            <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={3} py={1} display={{ base: "none", md: "inline-flex" }}>
              On-chain crowdfunding
            </Badge>
          </Flex>

          <HStack spacing={6} display={{ base: "none", md: "flex" }}>
            <Button fontSize={"md"} fontWeight={600} variant={"ghost"} color={useColorModeValue("gray.700", "gray.100")}>
              <NextLink href="/campaign/new">Launch Campaign</NextLink>
            </Button>
            <Button fontSize={"md"} fontWeight={600} variant={"ghost"} color={useColorModeValue("gray.700", "gray.100")}>
              <NextLink href="/#howitworks">How it Works</NextLink>
            </Button>
            <Button fontSize={"md"} fontWeight={600} variant={"ghost"} color={useColorModeValue("gray.700", "gray.100")}>
              <NextLink href="/#deploy">Deploy Guide</NextLink>
            </Button>

            {wallet.status === "connected" ? (
              <Menu>
                <MenuButton as={Button} rightIcon={<FiChevronDown />} colorScheme="purple" variant="outline" borderRadius="full">
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
                fontSize={"md"}
                fontWeight={700}
                color={"white"}
                bgGradient={"linear(to-r, brand.500, accent.500)"}
                _hover={{ bgGradient: "linear(to-r, brand.600, accent.600)" }}
                onClick={handleConnect}
                isLoading={wallet.status === "connecting"}
                borderRadius="full"
                px={6}
              >
                Connect Wallet
              </Button>
            )}

            <DarkModeSwitch />
          </HStack>

          <Flex display={{ base: "flex", md: "none" }}>
            <DarkModeSwitch />
          </Flex>
        </Container>
      </Flex>
      {wallet.error ? (
        <Container maxW="7xl" pt="84px">
          <Alert status="warning" rounded="xl" borderWidth="1px" borderColor="orange.200">
            <AlertIcon />
            <AlertDescription>{wallet.error}</AlertDescription>
          </Alert>
        </Container>
      ) : null}
    </Box>
  );
}
