"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import WelcomeScreen from "@/components/WelcomeScreen"
import WalletDashboard from "@/components/WalletDashboard"
import CreateAccount from "@/components/CreateAccount"
import ImportAccount from "@/components/ImportAccount"

export default function Home() {
  const [currentView, setCurrentView] = useState("welcome")
  const [wallet, setWallet] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [activeAccount, setActiveAccount] = useState(0)

  useEffect(() => {
    // Load saved accounts from localStorage
    const savedAccounts = localStorage.getItem("web3_accounts")
    if (savedAccounts) {
      const parsedAccounts = JSON.parse(savedAccounts)
      setAccounts(parsedAccounts)
      if (parsedAccounts.length > 0) {
        setCurrentView("dashboard")
        setWallet(new ethers.Wallet(parsedAccounts[0].privateKey))
      }
    }
  }, [])

  const saveAccounts = (newAccounts) => {
    localStorage.setItem("web3_accounts", JSON.stringify(newAccounts))
    setAccounts(newAccounts)
  }

  const createNewAccount = (accountData) => {
    const newAccounts = Array.isArray(accounts) ? [...accounts, accountData] : [accountData];
    saveAccounts(newAccounts)
    setWallet(new ethers.Wallet(accountData.privateKey))
    setActiveAccount(newAccounts.length - 1)
    setCurrentView("dashboard")
  }

  const importAccount = (accountData) => {
    // Make sure accounts is treated as an array, even if it's not initialized
    const newAccounts = Array.isArray(accounts) ? [...accounts, accountData] : [accountData];
    saveAccounts(newAccounts)
    setWallet(new ethers.Wallet(accountData.privateKey))
    setActiveAccount(newAccounts.length - 1)
    setCurrentView("dashboard")
  }

  const switchAccount = (index) => {
    setActiveAccount(index)
    setWallet(new ethers.Wallet(accounts[index].privateKey))
  }

  const deleteAccount = (index) => {
    const newAccounts = accounts.filter((_, i) => i !== index)
    saveAccounts(newAccounts)

    if (newAccounts.length === 0) {
      setCurrentView("welcome")
      setWallet(null)
      setActiveAccount(0)
    } else {
      const newActiveIndex = index === activeAccount ? 0 : index < activeAccount ? activeAccount - 1 : activeAccount
      setActiveAccount(newActiveIndex)
      setWallet(new ethers.Wallet(newAccounts[newActiveIndex].privateKey))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {currentView === "welcome" && (
          <WelcomeScreen
            onCreateWallet={() => setCurrentView("create")}
            onImportWallet={() => setCurrentView("import")}
          />
        )}

        {currentView === "create" && (
          <CreateAccount onAccountCreated={createNewAccount} onBack={() => setCurrentView("welcome")} />
        )}

        {currentView === "import" && (
          <ImportAccount onAccountImported={importAccount} onBack={() => setCurrentView("welcome")} />
        )}

        {currentView === "dashboard" && wallet && (
          <WalletDashboard
            wallet={wallet}
            accounts={accounts}
            activeAccount={activeAccount}
            onSwitchAccount={switchAccount}
            onCreateAccount={() => setCurrentView("create")}
            onImportAccount={() => setCurrentView("import")}
            onDeleteAccount={deleteAccount}
          />
        )}
      </div>
    </div>
  )
}
