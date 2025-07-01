"use client"

import { useState } from "react"
import { HDNodeWallet } from "ethers"
import { toast } from "react-toastify"


export default function CreateAccount({ onAccountCreated, onBack }) {


  const [step, setStep] = useState(1)
  const [accountName, setAccountName] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  const [mnemonicConfirmed, setMnemonicConfirmed] = useState(false)

  const generateWallet = async () => {

    try {
      // Generate an HD wallet with mnemonic (BIP-39/44)
      const hdWallet = await HDNodeWallet.createRandom();

      const phrase = hdWallet.mnemonic.phrase;

      setMnemonic(phrase);
      setStep(2);
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error("Wallet generation failed. Please try again.");
    }

  };

  const confirmAndCreate = () => {
    if (!mnemonicConfirmed) {
      toast.error("Please confirm you have saved your seed phrase!");
      return;
    }

    try {
      // Rebuild wallet from mnemonic phrase
      const restoredWallet = HDNodeWallet.fromPhrase(mnemonic);

      const accountData = {
        name: accountName,
        address: restoredWallet.address,
        privateKey: restoredWallet.privateKey,
        mnemonic: restoredWallet.mnemonic.phrase,
        createdAt: new Date().toISOString(),
      };

      onAccountCreated(accountData);
    } catch (error) {
      console.error("Error confirming wallet:", error);
      toast.error("Failed to create wallet. Please retry.");
    }
  };


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  placeholder="My Wallet"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={generateWallet}
                disabled={!accountName}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
              >
                Generate Wallet
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Save Your Seed Phrase</h3>
                <p className="text-white/70 text-sm">
                  Write down these 12 words in order. This is the only way to recover your wallet.
                </p>
              </div>

              <div className="bg-black/20 rounded-2xl p-4 border border-white/10">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {mnemonic.split(" ").map((word, index) => (
                    <div key={index} className="bg-white/10 rounded-lg p-2 text-center">
                      <span className="text-white/50 text-xs">{index + 1}</span>
                      <div className="text-white font-medium">{word}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => copyToClipboard(mnemonic)}
                  className="w-full py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <div>
                    <h4 className="text-red-300 font-medium text-sm">Important!</h4>
                    <p className="text-red-200 text-xs mt-1">
                      Never share your seed phrase. Anyone with these words can access your wallet.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={mnemonicConfirmed}
                  onChange={(e) => setMnemonicConfirmed(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
                <label htmlFor="confirm" className="text-white/80 text-sm">
                  I have saved my seed phrase securely
                </label>
              </div>

              <button
                onClick={confirmAndCreate}
                disabled={!mnemonicConfirmed}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
