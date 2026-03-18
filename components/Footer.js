import {
  Box,
  chakra,
  Container,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from "@chakra-ui/react";
import { FaGithub, FaGlobe, FaInstagram, FaTwitter } from "react-icons/fa";
import NextLink from "next/link";

const SocialButton = ({ children, label, href }) => {
  return (
    <chakra.a
      bg={useColorModeValue("whiteAlpha.800", "whiteAlpha.100")}
      rounded={"full"}
      w={10}
      h={10}
      cursor={"pointer"}
      href={href}
      display={"inline-flex"}
      alignItems={"center"}
      justifyContent={"center"}
      transition={"all 0.3s ease"}
      _hover={{
        transform: "translateY(-2px)",
        bg: useColorModeValue("purple.100", "whiteAlpha.200"),
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.a>
  );
};

export default function Footer() {
  return (
    <Box bg={useColorModeValue("gray.900", "gray.950")} color={"whiteAlpha.900"} mt={16}>
      <Container maxW={"6xl"} py={10}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <Stack spacing={4}>
            <Heading as="h2" size="lg" color="white">
              <NextLink href="/">✨ BetterFund</NextLink>
            </Heading>
            <Text color="whiteAlpha.700">
              Launch transparent crowdfunding campaigns with wallet-based contributions, on-chain approvals, and auditable withdrawals.
            </Text>
          </Stack>
          <Stack spacing={3}>
            <Text fontWeight="bold">Navigation</Text>
            <NextLink href="/">Home</NextLink>
            <NextLink href="/campaign/new">Launch Campaign</NextLink>
            <NextLink href="/#deploy">Deploy Guide</NextLink>
          </Stack>
          <Stack spacing={4}>
            <Text fontWeight="bold">Community</Text>
            <Text color="whiteAlpha.700">Built for makers who want modern web3 crowdfunding without hard-coded network setup.</Text>
            <Stack direction={"row"} spacing={4}>
              <SocialButton label={"Website"} href={"https://www.google.com/"}>
                <FaGlobe />
              </SocialButton>
              <SocialButton label={"Twitter"} href={"https://www.google.com/"}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={"Github"} href={"https://www.google.com/"}>
                <FaGithub />
              </SocialButton>
              <SocialButton label={"Instagram"} href={"https://www.google.com/"}>
                <FaInstagram />
              </SocialButton>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
