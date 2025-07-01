"use client"
import { toast } from "react-toastify"

export default function AccountManager({
  accounts,
  activeAccount,
  onSwitchAccount,
  onCreateAccount,
  onImportAccount,
  onDeleteAccount,
}) {
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Accounts</h3>
        <div className="flex space-x-2">
          <button
            onClick={onCreateAccount}
            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            title="Create Account"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onImportAccount}
            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            title="Import Account"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {accounts.map((account, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${index === activeAccount
              ? "bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/50"
              : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            onClick={() => onSwitchAccount(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{account.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{account.name}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(account.address)
                      }}
                      className="text-white/60 text-sm hover:text-white transition-colors flex items-center space-x-1"
                    >
                      <span>{formatAddress(account.address)}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {index === activeAccount && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                {accounts.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.success("Account deleted successfully")
                      onDeleteAccount(index)
                    }}
                    className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {account.imported && (
              <div className="mt-2 inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                Imported
              </div>
            )}
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-8 text-white/50">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <p>No accounts found</p>
          <p className="text-sm">Create or import an account to get started</p>
        </div>
      )}
    </div>
  )
}
