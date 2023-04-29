import React, { createContext, useState, useContext, useMemo, useEffect, ReactNode } from 'react'
import { BrowserWallet, Wallet } from '@meshsdk/core'
import { ADA_HANDLE_BADFOX4042, POLICY_ID_42_CHAIN, POLICY_ID_MUSIC_ALBUM } from '@/constants'

type ConnectFunc = (walletName: string, successCallback: () => void) => Promise<void>

const ctxInit: {
  availableWallets: Wallet[]
  connectWallet: ConnectFunc
  connecting: boolean
  connected: boolean
  connectedName: string
  wallet: BrowserWallet
  populatedWallet: { stakeKey: string; policyIds: string[]; is4042: boolean; isHolder: boolean }
} = {
  availableWallets: [],
  connectWallet: async (walletName, successCallback) => {},
  connecting: false,
  connected: false,
  connectedName: '',
  wallet: {} as BrowserWallet,
  populatedWallet: { stakeKey: '', policyIds: [], is4042: false, isHolder: false },
}

const WalletContext = createContext(ctxInit)

export const useWallet = () => {
  return useContext(WalletContext)
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [availableWallets, setAvailableWallets] = useState<Wallet[]>(ctxInit.availableWallets)

  useEffect(() => {
    setAvailableWallets(BrowserWallet.getInstalledWallets())
  }, [])

  const [connecting, setConnecting] = useState(ctxInit.connecting)
  const [connected, setConnected] = useState(ctxInit.connected)
  const [connectedName, setConnectedName] = useState(ctxInit.connectedName)

  const [wallet, setWallet] = useState<BrowserWallet>(ctxInit.wallet)
  const [populatedWallet, setPopulatedWallet] = useState(ctxInit.populatedWallet)

  const connectWallet: ConnectFunc = async (_walletName, _successCallback) => {
    if (connecting) return

    try {
      setConnecting(true)
      const _wallet = await BrowserWallet.enable(_walletName)

      if (!_wallet) {
        alert('Wallet not defined')
      } else {
        const netId = await _wallet.getNetworkId()

        if (!netId) {
          alert("Wallet isn't connected to mainnet")
        } else {
          const sKeys = await _wallet.getRewardAddresses()
          const pIds = await _wallet.getPolicyIds()
          const tIds = await _wallet.getAssets()

          setConnected(true)
          setConnectedName(_walletName)

          setWallet(_wallet)
          setPopulatedWallet({
            stakeKey: sKeys[0],
            policyIds: pIds,
            is4042: !!tIds.find((t) => t.unit === ADA_HANDLE_BADFOX4042),
            isHolder: pIds.includes(POLICY_ID_42_CHAIN) || pIds.includes(POLICY_ID_MUSIC_ALBUM),
          })

          _successCallback()
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setConnecting(false)
    }
  }

  const memoedValue = useMemo(
    () => ({
      availableWallets,
      connectWallet,
      connecting,
      connected,
      connectedName,
      wallet,
      populatedWallet,
    }),
    [availableWallets, connecting, connected, connectedName, wallet, populatedWallet]
  )

  return <WalletContext.Provider value={memoedValue}>{children}</WalletContext.Provider>
}
