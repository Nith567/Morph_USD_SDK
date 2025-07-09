import React from "react";
export type CryptomorphPayProps = {
    address: string;
    amount: string | number;
    currency: "ETH" | "USDT" | "USDC" | "USD";
    onSuccess?: (tx: any) => void;
    onError?: (err: any) => void;
    theme?: "light" | "dark";
};
export declare const CryptomorphPay: React.FC<CryptomorphPayProps>;
