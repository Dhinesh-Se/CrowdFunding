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
  colors: {
    brand: {
      50: "#eefcf7",
      100: "#d0f7eb",
      200: "#a8edd8",
      300: "#72dfbf",
      400: "#3bcfa6",
      500: "#1fb58d",
      600: "#138b6c",
      700: "#0e624d",
      800: "#0a3f33",
      900: "#05241d",
    },
    accent: {
      500: "#7c5cff",
      600: "#6546db",
    },
  },
  styles: {
    global: {
      body: {
        bgGradient: "linear(to-b, #f5fffb, #edf6ff)",
        color: "gray.800",
      },
    },
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
