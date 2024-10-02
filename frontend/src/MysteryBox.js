import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Container,
  ThemeProvider,
  createTheme,
  styled
} from "@mui/material"
import { Aptos, AptosConfig, Network} from "@aptos-labs/ts-sdk";
import { useWallet} from "@aptos-labs/wallet-adapter-react";
import CircularProgress from '@mui/material/CircularProgress';
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";
 


const theme = createTheme({
  palette: {
    primary: {
      main: '#4a90e2',
    },
    secondary: {
      main: '#f5a623',
    },
  },
})

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to bottom right, #4a90e2, #50e3c2)',
}))

const GlowingBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '256px',
  height: '256px',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-10px',
    background: theme.palette.secondary.main,
    filter: 'blur(15px)',
    opacity: 0.7,
  },
}))

export default function MysteryBox() {
  const [address, setAddress] = useState("")
  const [isRevealed, setIsRevealed] = useState(false)
  const [isAirdopped, setIsAirdropped] = useState(false)
  const [isPrizeShown, setIsPrizeShown] = useState(false)
  const [prize, setPrize] = useState(0)
  const [accountHasBox, setAccountHasBox] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [txnResponse, setTxnResponse] = useState("");

  const {
    connect,
    account,
    network,
    connected,
    disconnect,
    wallet,
    wallets,
    signAndSubmitTransaction,
    signAndSubmitBCSTransaction,
    signTransaction,
    signMessage,
    signMessageAndVerify,
  } = useWallet();

  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);

  const onConnect = async (walletName) => {
    await connect(walletName);
  };

  const handleBoxClick = () => {
    if (isRevealed && !isPrizeShown) {
      setIsPrizeShown(true)
    }
  }

  const handleSubmitAirdrop = (e) => {
    e.preventDefault()
    if (address) {
      AirdropBoxResource();
      
      setIsAirdropped(true);
      console.log(txnResponse);
      //setPrize(Math.floor(Math.random() * 1000) + 1)
    }
  }
  
  const handleSubmitOpen = (e) => {
    e.preventDefault()
    if (address) {
      OpenBoxResource()
      setIsRevealed(true)
      //setPrize(Math.floor(Math.random() * 1000) + 1)
    }
  }

  const AirdropBoxResource = async () => {
    if (!address || !account) return [];
    setTransactionInProgress(true);
    const moduleAddress = "0xb4c500b5a0beba1a70f41a2479c86e7d611bfaa381403d00971cef13040fb3d3";
    // change this to be your module account address
    const txn = signAndSubmitTransaction({
      sender: account?.address,
      data: {
        function:`${moduleAddress}::MysteryBoxv1::create_and_airdrop`,
        functionArguments:[address]
      }
    })
  try {
    // sign and submit transaction to chain
    const response = await signAndSubmitTransaction(txn);

    // wait for transaction
    let txnn = await aptos.waitForTransaction({transactionHash:response.hash});
    console.log(response);
    console.log(txnn);
    setTxnResponse(response);
    
    
    setAccountHasBox(true);
  } catch (error) {
    setAccountHasBox(false);
  }finally {
    setTransactionInProgress(false);
  }
}

  const OpenBoxResource = async () => {
    if (!address || !account) return [];
    
    setTransactionInProgress(true);

    // sign and submit transaction to chain
    const moduleAddress = "0xb4c500b5a0beba1a70f41a2479c86e7d611bfaa381403d00971cef13040fb3d3";

    const objResource = await aptos.getAccountResource(
      {accountAddress:address,
        resourceType:`${moduleAddress}::MysteryBoxv1::MysteryBox`}
    );
    console.log(objResource);
    setPrize("0.000000" + String(objResource.coins.value));
    console.log("0.000000" + String(objResource.coins.value));
    console.log((0.00000001 * objResource.coins.value).toString())
    
    const txn = signAndSubmitTransaction({
      sender: account?.address,
      data: {
        function:`${moduleAddress}::MysteryBoxv1::open_box`,
        functionArguments:[address]
      }
    })
    try {
      let txnn = await aptos.waitForTransaction({transactionHash:txn.hash});
      console.log(txnn);
    setAccountHasBox(true);
  } catch (error) {
    setAccountHasBox(false);
  }finally {
    setTransactionInProgress(false);
  }
}

useEffect(() => {
  OpenBoxResource();
}, [account?.address]);

useEffect(() => {
  AirdropBoxResource();
}, [account?.address]);


  
    // const moduleAddress = "0xb4c500b5a0beba1a70f41a2479c86e7d611bfaa381403d00971cef13040fb3d3";
    // try {
    //   const BoxResource = await aptos.getAccountResource(
    //     {
    //       accountAddress: address,
    //       resourceType:`${moduleAddress}::MysteryBoxv1::MysteryBox`
    //     }
    //   );
    //   console.log(BoxResource);
    //   setAccountHasBox(true);
    //   //setPrize()
    // } catch (e) {
    //   setAccountHasBox(false);
    // }

  return (
    <ThemeProvider theme={theme}>
      <GradientBackground>
        <Container maxWidth="sm">
          <Box sx={{ bgcolor: 'rgba(0, 0, 30, 0.3)', p: 4, borderRadius: 2, backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: 'white' }}>
              Mystery Box
            </Typography>
            <WalletConnector/>
            {!isRevealed ? 
              (transactionInProgress ? 
                
                (<Box sx={{ display: 'flex' }}>
                  <CircularProgress />
                </Box>
              ):
              (
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Airdrop Address or Box address"
                  variant="outlined"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: 'white' },
                      '&:hover fieldset': { borderColor: 'white' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiOutlinedInput-input': { color: 'white' },
                    paddingTop: '20px',
                  }}
                />
                <Button  onClick={handleSubmitAirdrop} variant="contained" fullWidth>
                  Airdrop Mystery Box
                </Button>
                <Button  onClick={handleSubmitOpen} variant="contained" fullWidth>
                  Open Mystery Box
                </Button>
              </Box>
            ))
             : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <GlowingBox>
                  <motion.div
                    animate={{ rotateY: isPrizeShown ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    onClick={handleBoxClick}
                    style={{ width: '100%', height: '100%', perspective: "1000px" }}
                  >
                    <Box sx={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
                      {/* Front of the box */}
                      <Box
                        component={motion.div}
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          paddingTop: '20px',
                          //backfaceVisibility: 'hidden',
                        }}
                        style={{ rotateY: 0 }}
                      >
                        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                          <defs>
                            <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#FFD700" />
                              <stop offset="100%" stopColor="#FFA500" />
                            </linearGradient>
                          </defs>
                          <rect x="20" y="20" width="160" height="160" fill="url(#boxGradient)" />
                          <path d="M20,20 L50,0 L190,0 L160,20 Z" fill="url(#boxGradient)" />
                          <path d="M180,20 L190,0 L190,160 L180,180 Z" fill="#FFA500" />
                          <text x="100" y="110" fontSize="60" fill="white" textAnchor="middle" dominantBaseline="middle">
                            
                          </text>
                        </svg>
                      </Box>
                      
                      <Box
                        component={motion.div}
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          paddingTop: '20px',
                          //backfaceVisibility: 'hidden',
                        }}
                        style={{ rotateY: 180 }}
                      >
                        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                          <defs>
                            <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#FFD700" />
                              <stop offset="100%" stopColor="#FFA500" />
                            </linearGradient>
                          </defs>
                          <rect x="20" y="20" width="160" height="160" fill="url(#boxGradient)" />
                          <path d="M20,20 L50,0 L190,0 L160,20 Z" fill="url(#boxGradient)" />
                          <path d="M180,20 L190,0 L190,160 L180,180 Z" fill="#FFA500" />
                          {isPrizeShown && (
                          <text x="100" y="110" fontSize="16" fill="white" textAnchor="middle" dominantBaseline="middle">
                            
                            {prize} APT
                          </text>
                          )}
                          {!isPrizeShown && (
                          <text x="100" y="110" fontSize="40" fill="white" textAnchor="middle" dominantBaseline="middle">
                            
                            
                          </text>
                          )}
                        </svg>
                      </Box>
                    </Box>
                  </motion.div>
                </GlowingBox>
                {!isPrizeShown && (
                  <Typography sx={{ mt: 2, color: 'white' }}>
                    Tap the box to reveal your prize!
                  </Typography>
                )}
                {isPrizeShown && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
                      Congratulations! You won {prize} APT Tokens!
                    </Typography>
                  </motion.div>
                )}
              </Box>
            )}
            {
              isAirdopped && (
                <Typography sx={{ mt: 2, color: 'white' }}>
                    Airdrop succesful!
                  </Typography>
              )
            }
          </Box>
        </Container>
      </GradientBackground>
    </ThemeProvider>
  )
}