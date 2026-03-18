import { useColorMode, IconButton } from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";

function DarkModeSwitch() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label="Toggle Dark Switch"
      icon={colorMode === "dark" ? <FiSun /> : <FiMoon />}
      onClick={toggleColorMode}
    />
  );
}

export default DarkModeSwitch;
