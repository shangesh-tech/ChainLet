"use client"

import { useState, useEffect } from 'react'
import { toast } from "react-toastify"
import { ethers } from "ethers"


const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
]

const FAUCET_ABI = [
    "function requestTokens() external",
    "function nextAccessTime(address) view returns (uint256)",
    "function withdrawalAmount() view returns (uint256)",
    "function getBalance() view returns (uint256)",
    "function token() view returns (address)",
    "function lockTime() view returns (uint256)"
]

const FAUCET_ADDRESS = "0x1E4081F2B2Ab3b66021598A35c469Ef08D81DB6A"
const ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/50SeX1XFCby8aAdx8vi_hj--dugRY7oV"

const Faucets = () => {
    const [recipientAddress, setRecipientAddress] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [tokenInfo, setTokenInfo] = useState({
        name: "Shangesh Token",
        symbol: "SHAN",
        decimals: 18
    })
    const [faucetInfo, setFaucetInfo] = useState({
        balance: "0",
        cooldownTime: 0,
        nextAccessTime: 0,
        withdrawalAmount: "0"
    })

    // Connect to provider on component mount
    useEffect(() => {
        const loadFaucetInfo = async () => {
            try {
                const provider = new ethers.JsonRpcProvider(ALCHEMY_URL)
                const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider)

                // Get token address from faucet
                const tokenAddress = await faucetContract.token()
                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)

                // Get token info
                const name = await tokenContract.name()
                const symbol = await tokenContract.symbol()
                const decimals = await tokenContract.decimals()

                // Get faucet info
                const balance = await faucetContract.getBalance()
                const withdrawalAmount = await faucetContract.withdrawalAmount()
                const lockTime = await faucetContract.lockTime()

                setTokenInfo({
                    name,
                    symbol,
                    decimals: Number(decimals)
                })

                setFaucetInfo({
                    balance: ethers.formatUnits(balance, decimals),
                    cooldownTime: Number(lockTime),
                    withdrawalAmount: ethers.formatUnits(withdrawalAmount, decimals)
                })

            } catch (error) {
                console.error("Error loading faucet info:", error)
            }
        }

        loadFaucetInfo()
    }, [])

    const validateAddress = (address) => {
        try {
            return ethers.isAddress(address)
        } catch (error) {
            return false
        }
    }

    const checkCooldown = async (address) => {

        try {
            const provider = new ethers.JsonRpcProvider(ALCHEMY_URL)
            const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider)

            const nextAccessTime = await faucetContract.nextAccessTime(address)
            return Number(nextAccessTime) * 1000 // Convert to milliseconds
        } catch (error) {
            console.error("Error checking cooldown:", error)
            return 0
        }
    }

    const handleGetTokens = async () => {
        if (!validateAddress(recipientAddress)) {
            toast.error("Please enter a valid wallet address")
            return
        }

        setIsLoading(true)

        try {
            // Check if user is in cooldown period
            const nextAccess = await checkCooldown(recipientAddress)
            const now = Date.now()

            if (nextAccess > now) {
                const timeLeft = Math.ceil((nextAccess - now) / 1000 / 60) // minutes
                toast.error(`Please wait ${timeLeft} minute${timeLeft !== 1 ? 's' : ''} before requesting again`)
                setIsLoading(false)
                return
            }

            // Connect with wallet
            if (!window.ethereum) {
                toast.error("Please install MetaMask or another web3 wallet")
                setIsLoading(false)
                return
            }

            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()

            // Check if connected wallet matches input address
            const connectedAddress = await signer.getAddress()
            if (connectedAddress.toLowerCase() !== recipientAddress.toLowerCase()) {
                toast.error("Connected wallet doesn't match the entered address")
                setIsLoading(false)
                return
            }

            // Connect to faucet contract with signer
            const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer)

            // Request tokens
            const tx = await faucetContract.requestTokens()

            // Wait for transaction to be mined
            toast.info("Transaction submitted. Please wait for confirmation...")
            await tx.wait()

            // Success!
            toast.success(`Successfully received ${faucetInfo.withdrawalAmount} ${tokenInfo.symbol} tokens!`)

            // Refresh faucet info
            const updatedBalance = await faucetContract.getBalance()

            setFaucetInfo(prev => ({
                ...prev,
                balance: ethers.formatUnits(updatedBalance, tokenInfo.decimals)
            }))

        } catch (error) {
            console.error("Faucet request failed:", error)
            if (error.message?.includes("Faucet has insufficient tokens")) {
                toast.error("The faucet has run out of tokens. Please try again later.")
            } else if (error.message?.includes("Please wait before requesting again")) {
                toast.error("You need to wait before requesting tokens again")
            } else {
                toast.error("Failed to send tokens. Please try again later.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Faucet</h3>
                <p className="text-white/60 mt-1">Get test tokens to use in the app</p>
            </div>

            <div className="space-y-6 bg-white/5 rounded-xl p-5 border border-white/10">
                {/* Token Selection */}
                <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Selected Token</label>
                    <div className="w-full bg-white/10 border border-white/20 rounded-xl text-white py-3 px-4">
                        {tokenInfo.name} ({tokenInfo.symbol})
                    </div>
                </div>

                {/* Faucet Info */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{tokenInfo.symbol}</span>
                        </div>
                        <div>
                            <h4 className="text-white font-medium">{tokenInfo.name}</h4>
                            <p className="text-white/60 text-sm">You will receive {faucetInfo.withdrawalAmount} {tokenInfo.symbol}</p>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-white/80">Faucet Balance:</span>
                            <span className="text-white">{parseFloat(faucetInfo.balance).toLocaleString()} {tokenInfo.symbol}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-white/80">Cooldown Period:</span>
                            <span className="text-white">{faucetInfo.cooldownTime ? Math.ceil(faucetInfo.cooldownTime / 60) : '1'} minute(s)</span>
                        </div>
                    </div>
                </div>

                {/* Address Input */}
                <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Your Wallet Address</label>
                    <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter your wallet address (0x...)"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-white/60 text-xs mt-2">Make sure your wallet is connected to Sepolia network</p>
                </div>

                {/* Get Tokens Button */}
                <button
                    onClick={handleGetTokens}
                    disabled={isLoading || !recipientAddress.trim()}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? "Processing..." : `Get ${faucetInfo.withdrawalAmount} ${tokenInfo.symbol} Tokens`}
                </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-white/5 rounded-xl p-5 border border-white/10">
                <h4 className="text-white font-medium mb-3">How it works</h4>
                <ul className="space-y-2 text-white/70 text-sm list-disc pl-5">
                    <li>Enter your wallet address above (must be the same as your connected wallet)</li>
                    <li>Make sure your wallet is connected to Sepolia test network</li>
                    <li>Click the &quot;Get Tokens&quot; button to request test tokens</li>
                    <li>Wait for the cooldown period before requesting again</li>
                    <li>Contract Address: <span className="text-blue-400">{FAUCET_ADDRESS}</span></li>
                </ul>
            </div>
        </div>
    )
}

export default Faucets