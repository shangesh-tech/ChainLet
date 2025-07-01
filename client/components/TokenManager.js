"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { toast } from "react-toastify"

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
]


export default function TokenManager({ wallet, provider, tokens, setTokens }) {
  const [showAddToken, setShowAddToken] = useState(false)
  const [tokenAddress, setTokenAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tokenBalances, setTokenBalances] = useState({})

  const loadTokenBalances = useCallback(async () => {
    if (!wallet || !provider) return;

    const balances = {}
    const address = wallet.address;

    for (const token of tokens) {
      try {
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
        const balance = await contract.balanceOf(address)
        balances[token.address] = ethers.formatUnits(balance, token.decimals)
      } catch (error) {
        console.error(`Error loading balance for ${token.symbol}:`, error)
        balances[token.address] = "0"
      }
    }

    setTokenBalances(balances)
  }, [wallet, provider, tokens])

  useEffect(() => {
    if (tokens.length > 0 && provider && wallet) {
      loadTokenBalances()
    }
  }, [tokens, provider, wallet, loadTokenBalances])

  const addToken = async () => {
    if (!tokenAddress.trim() || !provider || !wallet) return;

    try {
      setIsLoading(true);

      // Validate the address format
      let tokenAddr;
      try {
        tokenAddr = ethers.getAddress(tokenAddress.trim());
      } catch (error) {
        toast.error("Invalid token address format");
        setIsLoading(false);
        return;
      }

      // Check if token already exists
      if (tokens.some(token => token.address.toLowerCase() === tokenAddr.toLowerCase())) {
        toast.info("This token is already in your list");
        setIsLoading(false);
        return;
      }

      const address = wallet.address;
      let tokenData = {
        name: "Unknown Token",
        symbol: "UNK",
        decimals: 18
      };

      const contract = new ethers.Contract(tokenAddr, ERC20_ABI, provider);

      try { tokenData.name = await contract.name(); } catch (e) { console.warn("Couldn't get token name:", e); }
      try { tokenData.symbol = await contract.symbol(); } catch (e) { console.warn("Couldn't get token symbol:", e); }
      try {
        const decimals = await contract.decimals();
        tokenData.decimals = Number(decimals);
      } catch (e) {
        console.warn("Couldn't get token decimals:", e);
      }

      const newToken = {
        address: tokenAddr,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        addedAt: new Date().toISOString(),
      };

      const updatedTokens = [...tokens, newToken];
      setTokens(updatedTokens);

      // Save to localStorage
      localStorage.setItem(`tokens_${address}`, JSON.stringify(updatedTokens));

      setTokenAddress("");
      setShowAddToken(false);

      // Load balance for new token
      try {
        const contract = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
        const balance = await contract.balanceOf(address);
        setTokenBalances(prev => ({
          ...prev,
          [tokenAddr]: ethers.formatUnits(balance, tokenData.decimals),
        }));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setTokenBalances(prev => ({ ...prev, [tokenAddr]: "0" }));
      }

      toast.success(`Added ${tokenData.symbol} to your token list`);
    } catch (error) {
      console.error("Error adding token:", error);
      toast.error("Failed to add token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const removeToken = (tokenAddress) => {
    const updatedTokens = tokens.filter((token) => token.address !== tokenAddress);
    setTokens(updatedTokens);

    if (wallet) {
      try {
        localStorage.setItem(`tokens_${wallet.address}`, JSON.stringify(updatedTokens));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }

    // Remove balance
    setTokenBalances(prev => {
      const newBalances = { ...prev };
      delete newBalances[tokenAddress];
      return newBalances;
    });
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Tokens</h3>
        <button
          onClick={() => setShowAddToken(!showAddToken)}
          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
          title="Add Token"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Add Token Form */}
      {showAddToken && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <h4 className="text-white font-medium mb-3">Add Custom Token</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="Token contract address (0x...)"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <div className="flex space-x-2">
              <button
                onClick={addToken}
                disabled={isLoading || !tokenAddress.trim()}
                className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? "Adding..." : "Add Token"}
              </button>
              <button
                onClick={() => setShowAddToken(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token List */}
      <div className="space-y-3">
        {tokens.map((token, index) => (
          <div
            key={index}
            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{token.symbol.slice(0, 3).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">{token.name}</h4>
                  <button
                    onClick={() => copyToClipboard(token.address)}
                    className="text-white/60 text-sm hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <span>{formatAddress(token.address)}</span>
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

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-white font-medium">
                    {Number.parseFloat(tokenBalances[token.address] || "0").toFixed(4)} {token.symbol}
                  </div>
                  <div className="text-white/60 text-sm">≈ $0.00</div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${token.symbol} from your token list?`)) {
                      removeToken(token.address)
                    }
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {tokens.length === 0 && !showAddToken && (
        <div className="text-center py-8 text-white/50">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          <p>No custom tokens added</p>
          <p className="text-sm">Add tokens to track your portfolio</p>
        </div>
      )}
    </div>
  )
}
