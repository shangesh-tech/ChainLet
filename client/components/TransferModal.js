"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { toast } from "react-toastify"

export default function TransferModal({ currentAccount, provider, balance, onClose }) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: form, 2: confirm, 3: success
  const [txHash, setTxHash] = useState("")

  const validateForm = () => {
    if (!recipient.trim()) {
      toast.error("Please enter recipient address")
      return false
    }

    if (!ethers.isAddress(recipient)) {
      toast.error("Invalid recipient address")
      return false
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return false
    }

    if (Number.parseFloat(amount) > Number.parseFloat(balance)) {
      toast.error("Insufficient balance")
      return false
    }

    return true
  }

  const handleSend = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Use the wallet from currentAccount to send transaction
      const wallet = new ethers.Wallet(currentAccount.privateKey, provider)

      // Send the transaction using the wallet
      const tx = await wallet.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount)
      })

      toast.info("Transaction submitted to the network")
      setStep(3)
      setTxHash(tx.hash)
    } catch (error) {
      console.error("Transaction failed:", error)
      toast.error("Transaction failed. Please try again.")
    }

    setIsLoading(false)
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Send ETH</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Recipient */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Amount (ETH)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.0001"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => setAmount(balance)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 text-sm hover:text-purple-300"
                >
                  Max
                </button>
              </div>
              <div className="mt-1 text-white/60 text-sm">Balance: {Number.parseFloat(balance).toFixed(4)} ETH</div>
            </div>

            {/* Gas Fee Estimate */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Estimated Gas Fee</span>
                <span className="text-white text-sm">~0.001 ETH </span>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setStep(2)}
              disabled={!recipient || !amount}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Confirm Transaction</h3>
              <p className="text-white/70 text-sm">Please review the transaction details before sending</p>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/80 text-sm">To</span>
                    <span className="text-white text-sm font-mono">{formatAddress(recipient)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80 text-sm">Amount</span>
                    <span className="text-white text-sm font-semibold">{amount} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80 text-sm">Gas Fee</span>
                    <span className="text-white text-sm">~0.001 ETH</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">Total</span>
                      <span className="text-white font-semibold">
                        {(Number.parseFloat(amount) + 0.001).toFixed(4)} ETH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Transaction Sent!</h3>
              <p className="text-white/70">Your transaction has been submitted to the network</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/80 text-sm mb-2">Transaction Details</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Amount</span>
                  <span className="text-white">{amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">To</span>
                  <span className="text-white font-mono">{formatAddress(recipient)}</span>
                </div>
                {txHash && (
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                    >
                      View on Etherscan
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
