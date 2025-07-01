"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Image from "next/image"

export default function QRCodeModal({ address, onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  useEffect(() => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`
    setQrCodeUrl(qrUrl)
  }, [address])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Address copied to clipboard!")
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-sm w-full backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Receive ETH</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center space-y-6">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-2xl mx-auto w-fit">
            {qrCodeUrl ? (
              <div className="relative w-48 h-48">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "flex"
                  }}
                  unoptimized={true}
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-lg items-center justify-center">
                <span className="text-gray-500 text-sm">There was an error generating the QR Code</span>
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <p className="text-white/70 text-sm mb-2">Your wallet address</p>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white font-mono text-sm break-all mb-3">{address}</div>
              <button
                onClick={() => copyToClipboard(address)}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy Address</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <div>
                <h4 className="text-blue-300 font-medium text-sm">How to receive</h4>
                <p className="text-blue-200 text-xs mt-1">
                  Share this address or QR code with the sender. Only send Ethereum (ETH) and ERC-20 tokens to this
                  address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
