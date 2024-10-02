import logo from './logo.svg';
import './App.css';
import { AptosWalletAdapterProvider} from '@aptos-labs/wallet-adapter-react';
import { Network } from "@aptos-labs/ts-sdk";
import MysteryBox from './MysteryBox';

function App() {
  const wallets = [];
  return (
    <div className="App">
      <header className="App-header">
              <AptosWalletAdapterProvider
          plugins={wallets}
          autoConnect={true}
          optInWallets={["Petra"]}
          dappConfig={{ Network: Network.TESTNET }}
          onError={(error) => {
            console.log("error", error);
          }}
        >
        <MysteryBox/>
        </AptosWalletAdapterProvider>
      </header>
    </div>
  );
}

export default App;
