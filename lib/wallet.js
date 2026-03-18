import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState("");

  const syncAccounts = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      return [];
    }

    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    const activeAccount = accounts?.[0] || "";
    setAccount(activeAccount);
    setStatus(activeAccount ? "connected" : "disconnected");

    const activeChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    setChainId(activeChainId || "");

    return accounts;
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      const message = "MetaMask or another EIP-1193 wallet is required.";
      setError(message);
      setStatus("unavailable");
      throw new Error(message);
    }

    setError("");
    setStatus("connecting");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const activeAccount = accounts?.[0] || "";
      const activeChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setAccount(activeAccount);
      setChainId(activeChainId || "");
      setStatus(activeAccount ? "connected" : "disconnected");

      return activeAccount;
    } catch (connectError) {
      const message =
        connectError?.message || "Wallet connection request was rejected.";
      setError(message);
      setStatus("disconnected");
      throw connectError;
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount("");
    setChainId("");
    setError("");
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    syncAccounts().catch(() => {});

    if (typeof window === "undefined" || !window.ethereum) {
      return undefined;
    }

    const handleAccountsChanged = (accounts) => {
      const activeAccount = accounts?.[0] || "";
      setAccount(activeAccount);
      setStatus(activeAccount ? "connected" : "disconnected");
    };

    const handleChainChanged = (nextChainId) => {
      setChainId(nextChainId || "");
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("disconnect", handleDisconnect);

    return () => {
      if (!window.ethereum?.removeListener) {
        return;
      }

      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      window.ethereum.removeListener("disconnect", handleDisconnect);
    };
  }, [disconnect, syncAccounts]);

  const value = useMemo(
    () => ({
      account,
      chainId,
      connect,
      disconnect,
      error,
      hasProvider: typeof window !== "undefined" && Boolean(window.ethereum),
      status,
    }),
    [account, chainId, connect, disconnect, error, status]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within WalletProvider.");
  }

  return context;
}
