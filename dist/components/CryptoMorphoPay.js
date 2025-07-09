import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAccount, useConnect, useSendTransaction, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseEther } from "viem";
const USDT_ADDRESS = "0x07d9b60c7F719994c07C96a7f87460a0cC94379F";
const USDC_ADDRESS = "0xe3B620B1557696DA5324EFcA934Ea6c27ad69e00";
const ERC20_ABI = [
    {
        "constant": false,
        "inputs": [
            { "name": "_to", "type": "address" },
            { "name": "_value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
    }
];
export const CryptomorphPay = ({ address, amount, currency = "ETH", onSuccess, onError, theme = "light", }) => {
    const [open, setOpen] = useState(false);
    const [txHash, setTxHash] = useState(null);
    const [error, setError] = useState(null);
    const { isConnected } = useAccount();
    const { connect } = useConnect();
    // ETH payment
    const { data: ethTxData, sendTransaction, isPending: isEthPending, error: ethError } = useSendTransaction();
    // USDT/USDC payment
    const { data: tokenTxData, writeContract, isPending: isTokenPending, error: tokenError } = useWriteContract();
    const handlePay = async () => {
        setError(null);
        setTxHash(null);
        try {
            if (!isConnected) {
                connect({ connector: injected() });
                return;
            }
            if (currency === "ETH") {
                await sendTransaction({
                    to: address,
                    value: parseEther(String(amount)),
                });
            }
            else if (currency === "USDT" || currency === "USDC") {
                const tokenAddress = currency === "USDT" ? USDT_ADDRESS : USDC_ADDRESS;
                await writeContract({
                    address: tokenAddress,
                    abi: ERC20_ABI,
                    functionName: "transfer",
                    args: [address, BigInt(Math.floor(Number(amount) * 1e6))], // 6 decimals
                });
            }
        }
        catch (err) {
            setError(err.message || String(err));
            onError && onError(err);
        }
    };
    useEffect(() => {
        if (ethTxData && typeof ethTxData === 'object' && 'hash' in ethTxData) {
            setTxHash(ethTxData.hash);
            setError(null);
            onSuccess && onSuccess(ethTxData);
        }
        if (ethError) {
            setError(ethError.message);
            onError && onError(ethError);
        }
    }, [ethTxData, ethError]);
    useEffect(() => {
        if (tokenTxData && typeof tokenTxData === 'object' && 'hash' in tokenTxData) {
            setTxHash(tokenTxData.hash);
            setError(null);
            onSuccess && onSuccess(tokenTxData);
        }
        if (tokenError) {
            setError(tokenError.message);
            onError && onError(tokenError);
        }
    }, [tokenTxData, tokenError]);
    return (_jsxs(Dialog.Root, { open: open, onOpenChange: setOpen, children: [_jsx(Dialog.Trigger, { asChild: true, children: _jsx("button", { className: "px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition", children: "Pay with morph" }) }), _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "fixed inset-0 bg-black/40 z-40" }), _jsxs(Dialog.Content, { className: "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md", children: [_jsxs(Dialog.Title, { className: "text-lg font-bold mb-4", children: ["Pay ", amount, " ", currency] }), _jsx(Dialog.Description, { className: "mb-4 text-gray-500", children: "Complete your payment securely using your connected wallet." }), _jsxs("div", { className: "mb-6", children: [!isConnected ? (_jsx("button", { onClick: () => connect({ connector: injected() }), className: "w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition", children: "Connect Wallet" })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-2 text-sm text-gray-700 dark:text-gray-200", children: ["Pay to: ", _jsx("span", { className: "font-mono", children: address })] }), _jsx("button", { onClick: handlePay, className: "w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition", disabled: isEthPending || isTokenPending, children: currency === "ETH" ? (isEthPending ? "Processing..." : "Pay with ETH") : (isTokenPending ? "Processing..." : `Pay with ${currency}`) })] })), txHash && (_jsxs("div", { className: "mt-4 text-green-600 break-all", children: ["Payment sent! Tx: ", txHash] })), error && (_jsxs("div", { className: "mt-4 text-red-600 break-all", children: ["Error: ", error] }))] }), _jsx(Dialog.Close, { asChild: true, children: _jsx("button", { className: "absolute top-2 right-2 text-gray-500 hover:text-gray-700", children: "\u2715" }) })] })] })] }));
};
