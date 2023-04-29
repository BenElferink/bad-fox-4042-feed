import { Fragment, useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import Modal from './layout/Modal'
import Image from 'next/image'

const Profile = () => {
  const { availableWallets, connectWallet, connecting, connected, populatedWallet } = useWallet()
  const [openConnect, setOpenConnect] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)

  return (
    <Fragment>
      <button
        onClick={() => (connected ? setOpenProfile(true) : setOpenConnect(true))}
        className='flex flex-row p-4 border border-gray-400 rounded-xl text-center text-sm hover:animate-pulse'
      >
        {connected ? 'Profile' : 'Connect'}
      </button>

      <Modal
        title={connected ? 'Wallet Connected' : 'Connect a Wallet'}
        open={openConnect}
        onClose={() => setOpenConnect(false)}
        className='text-center'
      >
        {connected ? (
          <p className='m-2'>{populatedWallet.stakeKey}</p>
        ) : availableWallets.length == 0 ? (
          <p className='m-2'>No wallets installed...</p>
        ) : (
          <div className='flex flex-col min-w-[280px] w-[85%] md:w-[75%]'>
            {availableWallets.map((wallet, idx) => (
              <button
                key={`connect-wallet-${wallet.name}`}
                onClick={() => connectWallet(wallet.name, () => setOpenConnect(false))}
                disabled={connecting || connected}
                className='w-full mt-1 mx-auto py-2 px-4 flex items-center justify-start bg-gray-700 border border-gray-600'
                style={{
                  borderRadius:
                    idx === 0 && idx === availableWallets.length - 1
                      ? '1rem'
                      : idx === 0
                      ? '1rem 1rem 0 0'
                      : idx === availableWallets.length - 1
                      ? '0 0 1rem 1rem'
                      : '0',
                }}
              >
                <Image src={wallet.icon} alt={wallet.name} unoptimized width={35} height={35} className='mr-2' />
                {wallet.name}
              </button>
            ))}

            <p className='w-full my-2 px-1 text-xs text-start'>
              <u>Disclaimer</u>: Connecting your wallet does not require a password. It&apos;s a read-only process.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title={'Edit Profile'}
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        className='text-center'
      >
        <div className='flex flex-col min-w-[280px] w-[85%] md:w-[75%]'>Ja man :)</div>
      </Modal>
    </Fragment>
  )
}

export default Profile
