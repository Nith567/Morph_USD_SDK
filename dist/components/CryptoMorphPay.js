import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useWalletClient } from 'wagmi';
import { encodeFunctionData, parseUnits, parseEther } from "viem";
import { morphHolesky } from "viem/chains";
const USDT_ADDRESS = "0x07d9b60c7F719994c07C96a7f87460a0cC94379F";
const USDC_ADDRESS = "0xe3B620B1557696DA5324EFcA934Ea6c27ad69e00";
const ERC20_ABI = [
    {
        type: 'function',
        name: 'transfer',
        stateMutability: 'nonpayable',
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' }
        ],
        outputs: [
            { name: '', type: 'bool' }
        ]
    }
];
export const CryptomorphPay = ({ address, amount, currency = "ETH", onSuccess, onError, theme = "light", }) => {
    const { data: walletClient } = useWalletClient();
    const [open, setOpen] = useState(false);
    const [txHash, setTxHash] = useState(null);
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [selectedStable, setSelectedStable] = useState("USDT");
    const handlePay = async () => {
        setError(null);
        setTxHash(null);
        if (!walletClient) {
            setError("Please connect your wallet.");
            return;
        }
        setIsPending(true);
        try {
            let hash;
            let tokenToUse = currency === "USD" ? selectedStable : currency;
            if (tokenToUse === "ETH") {
                hash = await walletClient.sendTransaction({
                    to: address,
                    value: parseEther(String(amount)),
                    chain: morphHolesky,
                });
            }
            else if (tokenToUse === "USDT" || tokenToUse === "USDC") {
                const tokenAddress = tokenToUse === "USDT" ? USDT_ADDRESS : USDC_ADDRESS;
                const decimals = 6; // fixed for USDT/USDC
                const data = encodeFunctionData({
                    abi: ERC20_ABI,
                    functionName: "transfer",
                    args: [address, parseUnits(String(amount), decimals)],
                });
                hash = await walletClient.sendTransaction({
                    to: tokenAddress,
                    data,
                    chain: morphHolesky,
                });
            }
            else {
                throw new Error("Unsupported currency");
            }
            setTxHash(hash);
            onSuccess?.(hash);
        }
        catch (err) {
            setError(err.message || String(err));
            onError?.(err);
        }
        finally {
            setIsPending(false);
        }
    };
    return (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("button", { className: "px-8 py-3 rounded-lg shadow-lg font-semibold text-lg bg-gradient-to-r from-green-400 via-lime-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-lime-300 mb-4", onClick: () => setOpen((v) => !v), style: { letterSpacing: 1 }, children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsxs("svg", { width: "24", height: "24", fill: "none", viewBox: "0 0 24 24", className: "inline-block", children: [_jsx("circle", { cx: "12", cy: "12", r: "10", fill: "#00FFAA" }), _jsx("text", { x: "12", y: "16", textAnchor: "middle", fontSize: "12", fill: "#fff", children: "M" })] }), "Pay with Morpho"] }) }), open && (_jsxs("div", { className: "w-full max-w-md border border-green-400 rounded-2xl shadow-2xl p-6 animate-fade-in", style: {
                    background: "linear-gradient(135deg, #10151a 80%, #00FFAA 100%)",
                    boxShadow: "0 8px 32px 0 rgba(0,255,170,0.15)",
                    backdropFilter: "blur(8px)",
                }, children: [_jsxs("div", { className: "text-xl font-bold text-white mb-2", children: ["Pay ", amount, " ", currency === 'USD' ? selectedStable : currency] }), _jsx("div", { className: "mb-4 text-green-200 text-sm", children: "Complete your payment securely using your connected wallet." }), _jsxs("div", { className: "mb-2 text-green-300 text-xs font-mono", children: ["Pay to:", _jsx("br", {}), address] }), currency === "USD" && (_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-green-200 mb-1 font-semibold", children: "Choose stablecoin:" }), _jsxs("div", { className: "relative", children: [_jsxs("select", { value: selectedStable, onChange: e => setSelectedStable(e.target.value), className: "w-full rounded-lg border border-green-300 bg-gradient-to-r from-green-100 via-lime-100 to-emerald-100 px-3 py-2 text-green-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none shadow-inner", children: [_jsx("option", { value: "USDT", children: "USDT" }), _jsx("option", { value: "USDC", children: "USDC" })] }), _jsx("span", { className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-green-500", children: "\u25BC" })] })] })), !walletClient ? (_jsx("div", { className: "w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded text-center mb-2", children: "Please connect your wallet to continue." })) : (_jsx("button", { onClick: handlePay, className: "w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 disabled:opacity-60 mt-4", disabled: isPending, children: isPending ? "Processing..." : `Pay with ${currency === 'USD' ? selectedStable : currency}` })), txHash && (_jsxs("div", { className: "mt-4 text-green-400 break-all text-sm font-mono", children: ["Payment sent!", ' ', _jsx("a", { href: `https://explorer-holesky.morphl2.io/tx/${txHash}`, target: "_blank", rel: "noopener noreferrer", className: "underline text-green-300 hover:text-green-200", children: "View on Explorer \u2197" })] })), error && (_jsxs("div", { className: "mt-4 text-red-400 break-all text-sm font-mono", children: ["Error: ", error] }))] }))] }));
};
