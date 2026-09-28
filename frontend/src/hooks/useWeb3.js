import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  BSC_CHAIN_ID, 
  BSC_CHAIN_ID_HEX, 
  BSC_NETWORK, 
  USDT_CONTRACT_ADDRESS, 
  USDT_ABI 
} from '../config/web3Config';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [bnbBalance, setBnbBalance] = useState('0');

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Switch to BSC Network
  const switchToBSC = async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_NETWORK],
          });
          return true;
        } catch (addError) {
          console.error('Error adding BSC network:', addError);
          setError('Failed to add BSC network to wallet');
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      setError('Failed to switch to BSC network');
      return false;
    }
  };

  // Fetch USDT Balance
  const fetchUsdtBalance = useCallback(async (address, providerInstance) => {
    if (!address || !providerInstance) return;

    try {
      const usdtContract = new ethers.Contract(
        USDT_CONTRACT_ADDRESS,
        USDT_ABI,
        providerInstance
      );
      const balance = await usdtContract.balanceOf(address);
      const formattedBalance = ethers.utils.formatUnits(balance, 18);
      setUsdtBalance(formattedBalance);
    } catch (err) {
      console.error('Error fetching USDT balance:', err);
      setUsdtBalance('0');
    }
  }, []);

  // Fetch BNB Balance
  const fetchBnbBalance = useCallback(async (address, providerInstance) => {
    if (!address || !providerInstance) return;

    try {
      const balance = await providerInstance.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balance);
      setBnbBalance(formattedBalance);
    } catch (err) {
      console.error('Error fetching BNB balance:', err);
      setBnbBalance('0');
    }
  }, []);

  // Connect Wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('Please install MetaMask or Trust Wallet!');
      window.open('https://metamask.io/download/', '_blank');
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      // Check if on BSC
      if (network.chainId !== BSC_CHAIN_ID) {
        const switched = await switchToBSC();
        if (!switched) {
          throw new Error('Please switch to BSC network');
        }
        // Re-create provider after network switch
        const newProvider = new ethers.providers.Web3Provider(window.ethereum);
        const newSigner = newProvider.getSigner();
        setProvider(newProvider);
        setSigner(newSigner);
        await fetchUsdtBalance(accounts[0], newProvider);
        await fetchBnbBalance(accounts[0], newProvider);
      } else {
        setProvider(web3Provider);
        setSigner(web3Signer);
        await fetchUsdtBalance(accounts[0], web3Provider);
        await fetchBnbBalance(accounts[0], web3Provider);
      }

      setAccount(accounts[0]);
      setChainId(network.chainId);

      // Save to localStorage
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('connectedAddress', accounts[0]);

      return accounts[0];
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setUsdtBalance('0');
    setBnbBalance('0');
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('connectedAddress');
  };

  // Transfer USDT
  const transferUSDT = async (toAddress, amount) => {
    if (!signer || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const usdtContract = new ethers.Contract(
        USDT_CONTRACT_ADDRESS,
        USDT_ABI,
        signer
      );

      // Convert amount to wei (18 decimals for USDT on BSC)
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);

      // Check balance
      const balance = await usdtContract.balanceOf(account);
      if (balance.lt(amountInWei)) {
        throw new Error('Insufficient USDT balance');
      }

      // Estimate gas
      const gasEstimate = await usdtContract.estimateGas.transfer(toAddress, amountInWei);
      const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer

      // Send transaction
      const tx = await usdtContract.transfer(toAddress, amountInWei, {
        gasLimit: gasLimit,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      // Refresh balance
      await fetchUsdtBalance(account, provider);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
      };
    } catch (err) {
      console.error('Transfer error:', err);
      throw err;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (provider) {
          fetchUsdtBalance(accounts[0], provider);
          fetchBnbBalance(accounts[0], provider);
        }
      }
    };

    const handleChainChanged = (newChainId) => {
      const chainIdNum = parseInt(newChainId, 16);
      setChainId(chainIdNum);
      
      if (chainIdNum !== BSC_CHAIN_ID) {
        setError('Please switch to BSC network');
      } else {
        setError(null);
      }
      
      // Reload to ensure clean state
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, provider, fetchUsdtBalance, fetchBnbBalance]);

  // Auto-connect if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true' && isMetaMaskInstalled()) {
      connectWallet();
    }
  }, []);

  return {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    error,
    usdtBalance,
    bnbBalance,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    isConnected: !!account,
    isCorrectNetwork: chainId === BSC_CHAIN_ID,
    connectWallet,
    disconnectWallet,
    switchToBSC,
    transferUSDT,
    refreshBalance: () => {
      if (account && provider) {
        fetchUsdtBalance(account, provider);
        fetchBnbBalance(account, provider);
      }
    },
  };
};

export default useWeb3;
