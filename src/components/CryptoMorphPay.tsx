import React, { useState } from "react";
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
  currency: "ETH" | "USDT" | "USDC" | "USD";
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
  const [selectedStable, setSelectedStable] = useState<"USDT" | "USDC">("USDT");

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
      let tokenToUse = currency === "USD" ? selectedStable : currency;
      if (tokenToUse === "ETH") {
        hash = await walletClient.sendTransaction({
          to: address as `0x${string}`,
          value: parseEther(String(amount)),
          chain: morphHolesky,
        });
      } else if (tokenToUse === "USDT" || tokenToUse === "USDC") {
        const tokenAddress = tokenToUse === "USDT" ? USDT_ADDRESS : USDC_ADDRESS;
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

  // Close modal on backdrop click or close button
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="px-8 py-3 rounded-lg shadow-lg font-semibold text-lg bg-gradient-to-r from-green-400 via-lime-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-lime-300 mb-4"
        onClick={() => setOpen(true)}
        style={{ letterSpacing: 1 }}
      >
        <span className="inline-flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="inline-block"><circle cx="12" cy="12" r="10" fill="#00FFAA" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#fff">M</text></svg>
          Pay with Morpho
        </span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div
            className="relative w-full max-w-md border border-green-400 rounded-2xl shadow-2xl p-6 animate-fade-in"
            style={{
              background: "linear-gradient(135deg, #10151a 80%, #00FFAA 100%)",
              boxShadow: "0 8px 32px 0 rgba(0,255,170,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            <button
              className="absolute top-3 right-3 text-green-200 hover:text-green-400 text-xl font-bold focus:outline-none"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="text-xl font-bold text-white mb-2">Pay {amount} {currency === 'USD' ? selectedStable : currency}</div>
            <div className="mb-4 text-green-200 text-sm">Complete your payment securely using your connected wallet.</div>
            <div className="mb-2 text-green-300 text-xs font-mono">Pay to:<br />{address}</div>
            {currency === "USD" && (
              <div className="mb-4">
                <label className="block text-green-200 mb-1 font-semibold">Choose stablecoin:</label>
                <div className="relative">
                  <select
                    value={selectedStable}
                    onChange={e => setSelectedStable(e.target.value as "USDT" | "USDC")}
                    className="w-full rounded-lg border border-green-300 bg-gradient-to-r from-green-100 via-lime-100 to-emerald-100 px-3 py-2 text-green-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none shadow-inner"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                    ▼
                  </span>
                </div>
              </div>
            )}
            {!walletClient ? (
              <div className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded text-center mb-2">Please connect your wallet to continue.</div>
            ) : (
              <button
                onClick={handlePay}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 disabled:opacity-60 mt-4"
                disabled={isPending}
              >
                {isPending ? "Processing..." : `Pay with ${currency === 'USD' ? selectedStable : currency}`}
              </button>
            )}
            {txHash && (
              <div className="mt-4 text-green-400 break-all text-sm font-mono">
                Payment sent!{' '}
                <a
                  href={`https://explorer-holesky.morphl2.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-green-300 hover:text-green-200"
                >
                  View on Explorer ↗
                </a>
              </div>
            )}
            {error && (
              <div className="mt-4 text-red-400 break-all text-sm font-mono">Error: {error}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
