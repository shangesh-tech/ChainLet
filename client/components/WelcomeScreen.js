"use client"

import { useState, useEffect } from "react"

export default function WelcomeScreen({ onCreateWallet, onImportWallet }) {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 100)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className={`max-w-md w-full transform transition-all duration-1000 ${isAnimated ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        {/* Glassmorphism container */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Web3 Wallet</h1>
            <p className="text-white/70">Your gateway to the decentralized world</p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Secure Ethereum wallet</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Send & receive tokens</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Manage multiple accounts</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <button
              onClick={onCreateWallet}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Create New Wallet
            </button>

            <button
              onClick={onImportWallet}
              className="w-full py-4 bg-white/10 text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-200"
            >
              Import Existing Wallet
            </button>
          </div>

          {/* Security notice */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-200 text-sm text-center">
              🔒 Your private keys are stored locally and never shared
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
