import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useWalletClient } from 'wagmi';
import {
  encodeFunctionData,
  parseUnits,
  parseEther,
  Abi
} from "viem";
import { morphHolesky } from "viem/chains";

const USDT_ADDRESS = "0x07d9b60c7F719994c07C96a7f87460a0cC94379F";
const USDC_ADDRESS = "0xe3B620B1557696DA5324EFcA934Ea6c27ad69e00";

const ERC20_ABI: Abi = [
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

export type CryptomorphPayProps = {
  address: string; // merchant address
  amount: string | number;
  currency: "ETH" | "USDT" | "USDC";
  onSuccess?: (tx: any) => void;
  onError?: (err: any) => void;
  theme?: "light" | "dark";
};

export const CryptomorphPay: React.FC<CryptomorphPayProps> = ({
  address,
  amount,
  currency = "ETH",
  onSuccess,
  onError,
  theme = "light",
}) => {
  const { data: walletClient } = useWalletClient();
  const [open, setOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      let hash: string;

      if (currency === "ETH") {
        hash = await walletClient.sendTransaction({
          to: address as `0x${string}`,
          value: parseEther(String(amount)),
          chain: morphHolesky,
        });
      } else if (currency === "USDT" || currency === "USDC") {
        const tokenAddress = currency === "USDT" ? USDT_ADDRESS : USDC_ADDRESS;
        const decimals = 6; // fixed for USDT/USDC
        const data = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [address, parseUnits(String(amount), decimals)],
        });

        hash = await walletClient.sendTransaction({
          to: tokenAddress as `0x${string}`,
          data,
          chain: morphHolesky,
        });
      } else {
        throw new Error("Unsupported currency");
      }

      setTxHash(hash);
      onSuccess?.(hash);
    } catch (err: any) {
      setError(err.message || String(err));
      onError?.(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
          Pay with morph
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
          <Dialog.Title className="text-lg font-bold mb-4">Pay {amount} {currency}</Dialog.Title>
          <Dialog.Description className="mb-4 text-gray-500">
            Complete your payment securely using your connected wallet.
          </Dialog.Description>
          <div className="mb-6">
            {!walletClient ? (
              <div className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded text-center">
                Please connect your wallet to continue.
              </div>
            ) : (
              <>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                  Pay to: <span className="font-mono">{address}</span>
                </div>
                <button
                  onClick={handlePay}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  disabled={isPending}
                >
                  {isPending ? "Processing..." : `Pay with ${currency}`}
                </button>
              </>
            )}
            {txHash && (
              <div className="mt-4 text-green-600 break-all">Payment sent! Tx: {txHash}</div>
            )}
            {error && (
              <div className="mt-4 text-red-600 break-all">Error: {error}</div>
            )}
          </div>
          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
