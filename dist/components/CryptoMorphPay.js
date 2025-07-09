import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
            if (currency === "ETH") {
                hash = await walletClient.sendTransaction({
                    to: address,
                    value: parseEther(String(amount)),
                    chain: morphHolesky,
                });
            }
            else if (currency === "USDT" || currency === "USDC") {
                const tokenAddress = currency === "USDT" ? USDT_ADDRESS : USDC_ADDRESS;
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
    return (_jsxs(Dialog.Root, { open: open, onOpenChange: setOpen, children: [_jsx(Dialog.Trigger, { asChild: true, children: _jsx("button", { className: "px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition", children: "Pay with morph" }) }), _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "fixed inset-0 bg-black/40 z-40" }), _jsxs(Dialog.Content, { className: "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md", children: [_jsxs(Dialog.Title, { className: "text-lg font-bold mb-4", children: ["Pay ", amount, " ", currency] }), _jsx(Dialog.Description, { className: "mb-4 text-gray-500", children: "Complete your payment securely using your connected wallet." }), _jsxs("div", { className: "mb-6", children: [!walletClient ? (_jsx("div", { className: "w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded text-center", children: "Please connect your wallet to continue." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-2 text-sm text-gray-700 dark:text-gray-200", children: ["Pay to: ", _jsx("span", { className: "font-mono", children: address })] }), _jsx("button", { onClick: handlePay, className: "w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition", disabled: isPending, children: isPending ? "Processing..." : `Pay with ${currency}` })] })), txHash && (_jsxs("div", { className: "mt-4 text-green-600 break-all", children: ["Payment sent! Tx: ", txHash] })), error && (_jsxs("div", { className: "mt-4 text-red-600 break-all", children: ["Error: ", error] }))] }), _jsx(Dialog.Close, { asChild: true, children: _jsx("button", { className: "absolute top-2 right-2 text-gray-500 hover:text-gray-700", children: "\u2715" }) })] })] })] }));
};
