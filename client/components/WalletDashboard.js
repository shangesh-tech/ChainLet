"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import AccountManager from "./AccountManager"
import TokenManager from "./TokenManager"
import TransferModal from "./TransferModal"
import QRCodeModal from "./QRCodeModal"
import { toast } from "react-toastify"
import Faucets from "./Faucets"


export default function WalletDashboard({
  wallet,
  accounts,
  activeAccount,
  onSwitchAccount,
  onCreateAccount,
  onImportAccount,
  onDeleteAccount,
}) {
  const [currentTab, setCurrentTab] = useState("accounts")
  const [balance, setBalance] = useState("0")
  const [tokens, setTokens] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showTransfer, setShowTransfer] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [provider, setProvider] = useState(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Define currentAccount from the accounts array
  const currentAccount = accounts[activeAccount]

  const ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/50SeX1XFCby8aAdx8vi_hj--dugRY7oV";

  useEffect(() => {
    const fetchWalletData = async () => {
      const newProvider = new ethers.JsonRpcProvider(ALCHEMY_URL)
      setProvider(newProvider)
      if (currentAccount) {
        const address = currentAccount.address

        // Get ETH balance
        const bal = await newProvider.getBalance(address)
        setBalance(ethers.formatEther(bal))
        console.log("Balance:", ethers.formatEther(bal))

        // Load saved tokens
        const savedTokens = localStorage.getItem(`tokens_${address}`)
        if (savedTokens) {
          setTokens(JSON.parse(savedTokens))
        }

        // Fetch transaction history from blockchain
        fetchTransactionHistory(address)
      }
    }
    fetchWalletData()

  }, [currentAccount])

  // Fetch transaction history from blockchain using the Alchemy API
  const fetchTransactionHistory = async (address) => {
    try {
      setIsLoadingHistory(true);

      // Fetch sent transactions
      const sentTxsResponse = await fetch(ALCHEMY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getAssetTransfers",
          params: [
            {
              fromBlock: "0x0",
              toBlock: "latest",
              fromAddress: address,
              category: ["external", "internal", "erc20", "erc721", "erc1155"]
            }
          ]
        })
      });

      // Fetch received transactions
      const receivedTxsResponse = await fetch(ALCHEMY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getAssetTransfers",
          params: [
            {
              fromBlock: "0x0",
              toBlock: "latest",
              toAddress: address,
              category: ["external", "internal", "erc20", "erc721", "erc1155"]
            }
          ]
        })
      });

      const sentData = await sentTxsResponse.json();
      const receivedData = await receivedTxsResponse.json();

      let newTransactions = [];

      // Process sent transactions
      if (sentData && sentData.result && sentData.result.transfers) {
        const sentTxs = sentData.result.transfers.map(tx => {

          return {
            type: 'sent',
            amount: tx.value,
            counterparty: tx.to,
            hash: tx.hash,
            blockNumber: tx.blockNum,
            asset: tx.asset || 'ETH'
          };
        });
        newTransactions = [...newTransactions, ...sentTxs];
      }

      // Process received transactions
      if (receivedData && receivedData.result && receivedData.result.transfers) {
        const receivedTxs = receivedData.result.transfers.map(tx => {

          return {
            type: 'received',
            amount: tx.value,
            counterparty: tx.from,
            hash: tx.hash,
            blockNumber: tx.blockNum,
            asset: tx.asset || 'ETH'
          };
        });
        newTransactions = [...newTransactions, ...receivedTxs];
      }

      if (newTransactions.length > 0) {
        const sortedTransactions = newTransactions.sort((a, b) => b.blockNumber - a.blockNumber)

        setTransactions(sortedTransactions)
        toast.success(`Loaded ${newTransactions.length} transactions from blockchain`)
      } else {
        toast.info("No transactions found");
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatAddress = (address) => {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const tabs = [
    { id: "transactions", name: "Transactions", icon: "💼" },
    { id: "accounts", name: "Accounts", icon: "👤" },
    { id: "tokens", name: "Tokens", icon: "🪙" },
    { id: "faucet", name: "Faucet", icon: "💧" },
  ]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">{currentAccount?.name || "My Wallet"}</h1>
              <button
                onClick={() => copyToClipboard(currentAccount.address)}
                className="text-white/70 text-sm hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>{formatAddress(currentAccount.address)}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQR(true)}
                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-white mb-1">
              {Number.parseFloat(balance).toFixed(4)} ETH
            </div>
            <div className="text-white/50 text-sm">
              {`≈ $${(Number.parseFloat(balance) * 2500).toFixed(2)} USD`}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowTransfer(true)}
              className="py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              Send
            </button>
            <button
              onClick={() => setShowQR(true)}
              className="py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-200"
            >
              Receive
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-1 border border-white/20 shadow-xl mb-4">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${currentTab === tab.id
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
              >
                <div className="text-lg mb-1">{tab.icon}</div>
                <div className="text-xs">{tab.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl">
          {currentTab === "transactions" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button
                  onClick={() => fetchTransactionHistory(currentAccount.address)}
                  disabled={isLoadingHistory}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center disabled:opacity-50"
                >
                  {isLoadingHistory ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-3">
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${tx.type === 'sent' ? 'text-red-400' : 'text-green-400'} mr-2`}>
                            {tx.type === 'sent' ? 'Sent' : 'Received'}
                          </span>
                          {tx.asset && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                              {tx.asset}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white font-mono text-sm">
                          {tx.type === 'sent' ? 'To: ' : 'From: '}{formatAddress(tx.counterparty)}
                        </span>
                        <div className="flex flex-col items-end space-x-2">
                          <span className={`font-semibold ${tx.type === 'sent' ? 'text-red-400' : 'text-green-400'}`}>
                            {tx.type === 'sent' ? '-' : '+'}{tx.amount} {tx.asset || 'ETH'}
                          </span>
                          <span className="text-white/50 text-sm">
                            {`≈ $${(Number.parseFloat(tx.amount) * 2500).toFixed(2)} USD`}
                          </span>
                        </div>
                      </div>
                      {tx.hash && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
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
                  ))
                ) : (
                  <div className="text-center py-8 text-white/50">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <p>No transactions yet</p>
                    <p className="text-sm">Your transaction history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === "accounts" && (
            <AccountManager
              accounts={accounts}
              activeAccount={activeAccount}
              onSwitchAccount={onSwitchAccount}
              onCreateAccount={onCreateAccount}
              onImportAccount={onImportAccount}
              onDeleteAccount={onDeleteAccount}
            />
          )}

          {currentTab === "tokens" && (
            <TokenManager wallet={wallet} provider={provider} tokens={tokens} setTokens={setTokens} />
          )}
          {
            currentTab === "faucet" && (
              <Faucets />
            )
          }
        </div>
      </div>

      {/* Modals */}
      {showTransfer && (
        <TransferModal
          wallet={wallet}
          provider={provider}
          balance={balance}
          currentAccount={currentAccount}
          onClose={() => setShowTransfer(false)}
        />
      )}

      {showQR && <QRCodeModal address={currentAccount.address} onClose={() => setShowQR(false)} />}
    </div>
  )
}
