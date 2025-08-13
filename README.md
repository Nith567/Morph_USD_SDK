# Morph Stablecoin Checkout SDK

A hackathon-ready, plug-and-play React component for accepting stablecoin (USDT, USDC, ETH) payments on the Morph Holesky Testnet. Built for speed, simplicity, and beautiful green Morph UI.

## 🚀 Features
- Accept payments in **USDT**, **USDC**, or **ETH** on Morph Holesky
- **"USD"** mode lets users pick USDT or USDC at checkout
- Fully self-contained React component
- Easy integration 

## 🛠️ Installation
```bash
npm install morph-stablecoin-checkout
```

## 🧑‍💻 Usage
```tsx
import { CryptomorphPay } from 'morph-stablecoin-checkout';

<CryptomorphPay
  address="0xYourMerchantAddress"
  amount="10"
  currency="USD" // or "USDT", "USDC", "ETH"
  onSuccess={tx => console.log('Payment success:', tx)}
  onError={err => console.error('Payment error:', err)}
/>
```

- If `currency="USD"`, user can select USDT or USDC in the modal.
- If `currency="USDT"`, `"USDC"`, or `"ETH"`, no selection is shown.

## 💸 Supports
- USDT (0x07d9b60c7F719994c07C96a7f87460a0cC94379F)
- USDC (0xe3B620B1557696DA5324EFcA934Ea6c27ad69e00)
- ETH (native)


## Example

