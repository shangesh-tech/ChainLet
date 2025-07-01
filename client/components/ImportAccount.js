"use client"

import { useState } from "react"
import { ethers, HDNodeWallet, Wallet } from "ethers"

export default function ImportAccount({ onAccountImported, onBack }) {
  const [importMethod, setImportMethod] = useState("mnemonic") // 'mnemonic' or 'privateKey'
  const [accountName, setAccountName] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  const importWallet = async () => {
    setIsImporting(true)

    try {
      let wallet

      if (importMethod === "mnemonic") {
        if (!mnemonic.trim()) {
          alert("Please enter a valid seed phrase")
          setIsImporting(false)
          return
        }
        wallet = ethers.HDNodeWallet.fromPhrase(mnemonic.trim())
      } else {
        if (!privateKey.trim()) {
          alert("Please enter a valid private key")
          setIsImporting(false)
          return
        }
        wallet = new ethers.Wallet(privateKey.trim())
      }

      const accountData = {
        name: accountName || `Imported Account`,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: importMethod === "mnemonic" ? mnemonic.trim() : null,
        imported: true,
        createdAt: new Date().toISOString(),
      }

      onAccountImported(accountData)
    } catch (error) {
      console.error("Error importing wallet:", error)
      alert("Invalid seed phrase or private key. Please check and try again.")
    }

    setIsImporting(false)
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
            <h2 className="text-2xl font-bold text-white">Import Account</h2>
          </div>

          <div className="space-y-6">
            {/* Account Name */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Account Name (Optional)</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Imported Wallet"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Import Method Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Import Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setImportMethod("mnemonic")}
                  className={`p-3 rounded-xl border transition-all ${importMethod === "mnemonic"
                    ? "bg-purple-500/20 border-purple-500 text-white"
                    : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                >
                  <div className="text-sm font-medium">Seed Phrase</div>
                  <div className="text-xs opacity-70">12 words</div>
                </button>
                <button
                  onClick={() => setImportMethod("privateKey")}
                  className={`p-3 rounded-xl border transition-all ${importMethod === "privateKey"
                    ? "bg-purple-500/20 border-purple-500 text-white"
                    : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                >
                  <div className="text-sm font-medium">Private Key</div>
                  <div className="text-xs opacity-70">64 characters</div>
                </button>
              </div>
            </div>

            {/* Import Input */}
            {importMethod === "mnemonic" ? (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Seed Phrase</label>
                <textarea
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="Enter your 12-word seed phrase separated by spaces"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Private Key</label>
                <input
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your private key (0x...)"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Security Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <div>
                  <h4 className="text-yellow-300 font-medium text-sm">Security Notice</h4>
                  <p className="text-yellow-200 text-xs mt-1">
                    Never share your seed phrase or private key. Make sure you&apos;re in a secure environment.
                  </p>
                </div>
              </div>
            </div>

            {/* Import Button */}
            <button
              onClick={importWallet}
              disabled={isImporting || (!mnemonic.trim() && !privateKey.trim())}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              {isImporting ? "Importing..." : "Import Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
