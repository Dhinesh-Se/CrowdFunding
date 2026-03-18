import "../styles/globals.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "@fontsource/space-grotesk";
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";
import { WalletProvider } from "../lib/wallet";

const theme = extendTheme({
  fonts: {
    heading: "Space Grotesk",
    body: "Space Grotesk",
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <WalletProvider>
        <NavBar />
        <Component {...pageProps} />
        <Footer />
      </WalletProvider>
    </ChakraProvider>
  );
}

export default MyApp;
