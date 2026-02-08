"use client";

import { FC, ReactNode, useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
    children: ReactNode;
}

const WalletContextProvider: FC<WalletContextProviderProps> = ({
    children,
}) => {
    // Get RPC endpoint from environment variable
    const endpoint = useMemo(
        () =>
            process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com",
        []
    );

    // Initialize wallet adapters - only created once
    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletContextProvider;
