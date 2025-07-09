"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { WagmiProvider, createConfig } from "wagmi";
import { http } from "viem";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
// Morph Holesky Testnet config
const morphHolesky = {
    id: 2810,
    name: "Morph Holesky Testnet",
    network: "morph-holesky",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ["https://rpc-quicknode-holesky.morphl2.io"] },
        public: { http: ["https://rpc-quicknode-holesky.morphl2.io"] },
    },
    blockExplorers: {
        default: { name: "Morph Explorer", url: "https://explorer-holesky.morphl2.io" },
    },
    testnet: true,
};
const config = createConfig({
    chains: [morphHolesky],
    transports: {
        [morphHolesky.id]: http(),
    },
});
export default function Home() {
    return (_jsx(WagmiProvider, { config: config, children: _jsx(RainbowKitProvider, { children: _jsx("main", { className: "flex min-h-screen flex-col items-center justify-between p-24" }) }) }));
}
