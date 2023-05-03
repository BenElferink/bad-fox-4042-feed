import { createContext, useState, useContext, useMemo, useEffect, ReactNode } from 'react'
import { BrowserWallet, Wallet } from '@meshsdk/core'
import fetchProfile from '@/functions/fetchProfile'
import { ADA_HANDLE_BADFOX4042, POLICY_ID_42_CHAIN, POLICY_ID_MUSIC_ALBUM } from '@/constants'
import type { PopulatedWallet, Profile } from '@/@types'

const ctxInit: {
  availableWallets: Wallet[]
  connectWallet: (walletName: string) => Promise<void>
  connecting: boolean
  connected: boolean
  connectedName: string
  wallet: BrowserWallet
  populatedWallet: null | PopulatedWallet
  profile: null | Profile
} = {
  availableWallets: [],
  connectWallet: async (walletName) => {},
  connecting: false,
  connected: false,
  connectedName: '',
  wallet: {} as BrowserWallet,
  populatedWallet: null,
  profile: null,
}

const WalletContext = createContext(ctxInit)

export const useWallet = () => {
  return useContext(WalletContext)
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [availableWallets, setAvailableWallets] = useState(ctxInit.availableWallets)

  useEffect(() => {
    setAvailableWallets(BrowserWallet.getInstalledWallets())
  }, [])

  const [connecting, setConnecting] = useState(ctxInit.connecting)
  const [connected, setConnected] = useState(ctxInit.connected)
  const [connectedName, setConnectedName] = useState(ctxInit.connectedName)

  const [wallet, setWallet] = useState(ctxInit.wallet)
  const [populatedWallet, setPopulatedWallet] = useState(ctxInit.populatedWallet)
  const [profile, setProfile] = useState(ctxInit.profile)

  const connectWallet: typeof ctxInit['connectWallet'] = async (_walletName) => {
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
            tokenIds: tIds,
            is4042: !!tIds.find((t) => t.unit === ADA_HANDLE_BADFOX4042),
            isHolder: pIds.includes(POLICY_ID_42_CHAIN) || pIds.includes(POLICY_ID_MUSIC_ALBUM),
          })

          setProfile(await fetchProfile(sKeys[0]))
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
      profile,
    }),
    [availableWallets, connecting, connected, connectedName, wallet, populatedWallet, profile]
  )

  return <WalletContext.Provider value={memoedValue}>{children}</WalletContext.Provider>
}
