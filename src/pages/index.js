import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import abi from '../abi.json'
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })
const contract_address = "0x8780D67D8dB320c0130738C3B985E37dFe7b6cBE";
export default function Home() {

  const [walletConnected, setWalletconnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  const [loading, setLoading] = useState(false);

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  let web3Modalref = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    // console.log(web3Modalref.connect)
      const provider = await web3Modalref.current.connect();
      console.log(provider, "aaasa")
      const web3provider = new providers.Web3Provider(provider)
      //  console.log(provider, "PPP")
      const {chainId} = await web3provider.getNetwork();

      if(chainId !== 5) {
        window.alert("please change the network to goerli");
        throw new Error("change network to Goerli");
      }
       console.log("sss")
      if(needSigner) {
        const signer = web3provider.getSigner();
        return signer;
      }

      return web3provider;
  }
  
   const getNumberOfWhitelisted = async () => {
      try {
         const provider = await getProviderOrSigner();
         const contract = new Contract(contract_address, abi["abi"], provider);

         const _numberOfWhitelisted = await contract.numwhitelistedAddresses();
         console.log(_numberOfWhitelisted)
         setNumberOfWhitelisted(_numberOfWhitelisted.toNumber())
      } catch(err) {
        console.log(err)
      }
   }
   
   const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const contract = new Contract(contract_address, abi["abi"], signer);
      const signer_address = await signer.getAddress();

      const _joinedWhitelisted = await contract.whitelistedAddresses(signer_address);

      setJoinedWhitelist(_joinedWhitelisted);
    } catch(err) {
      console.log(err)
    }
   }
   
    const connectWallet = async () => {
      try {
        await getProviderOrSigner();
        setWalletconnected(true);

        checkIfAddressInWhitelist();
        getNumberOfWhitelisted()
      } catch(err) {
        console.log(err)
      }
    }

  const addAddressToWhitelist = async () => {
      try {
        const signer = await getProviderOrSigner(true)
        const contract = new Contract(contract_address, abi["abi"], signer);
        const tx = await contract.whitelist(signer.getAddress());
        setLoading(true);
        await tx.wait();


        await getNumberOfWhitelisted();
        setJoinedWhitelist(true);
      } catch (err) {
       console.log(err);
      }

  }

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };
    useEffect(() => {
      if(!walletConnected) {
        web3Modalref.current = new Web3Modal({
          network: "goerli",
          providerOptions: {},
          disableInjectedProvider: false
        })
        console.log(web3Modalref)
        connectWallet();
      }
      
    }, [walletConnected])
  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}
