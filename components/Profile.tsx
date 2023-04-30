import Image from 'next/image'
import { Fragment, useEffect, useState } from 'react'
import { KeyIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { firestore } from '@/utils/firebase'
import { useWallet } from '@/contexts/WalletContext'
import fetchProfile from '@/functions/fetchProfile'
import Modal from './layout/Modal'
import TextChip from './TextChip'
import { PROFILES_DB_PATH } from '@/constants'

const Profile = () => {
  const { availableWallets, connectWallet, connecting, connected, populatedWallet, profile } = useWallet()

  const [openConnect, setOpenConnect] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)

  const [loading, setLoading] = useState(false)
  const [profileUname, setProfileUname] = useState('')
  const [profilePicture, setProfilePicture] = useState('')

  const updateProfile = async () => {
    setLoading(true)

    const fetchedProfile = await fetchProfile(populatedWallet?.stakeKey as string)
    const collection = firestore.collection(PROFILES_DB_PATH)

    if (!fetchedProfile) {
      await collection.add({
        stakeKey: populatedWallet?.stakeKey,
        uname: profileUname,
        pfp: profilePicture,
      })
    } else {
      await collection.doc(fetchedProfile.id).update({
        uname: profileUname,
        pfp: profilePicture,
      })
    }

    setLoading(false)
  }

  useEffect(() => {
    if (connected && profile) {
      setProfileUname(profile.uname || '')
      setProfilePicture(profile.pfp || '')
      setOpenConnect(false)
    }
  }, [connected, profile])

  return (
    <Fragment>
      <button
        onClick={() => (connected ? setOpenProfile(true) : setOpenConnect(true))}
        className='flex flex-row p-4 border border-gray-400 rounded-xl text-center text-sm hover:animate-pulse'
      >
        {connected ? 'Profile' : 'Connect'}
      </button>

      <Modal
        title={connecting ? '' : connected ? 'Connected' : 'Connect a Wallet'}
        open={openConnect}
        onClose={() => (!connecting ? setOpenConnect(false) : null)}
        className='text-center'
      >
        {connecting ? (
          <div>
            <p className='m-2'>Connecting...</p>
          </div>
        ) : connected ? (
          <div>
            <TextChip icon={KeyIcon} prefix='Stake Key' value={populatedWallet?.stakeKey || ''} />

            {!profile ? (
              <div className='mt-4'>
                <p>Setup your profile now, or later?</p>
                <div className='mt-2 flex items-center justify-evenly'>
                  <button
                    onClick={() => {
                      setOpenConnect(false)
                      setOpenProfile(true)
                    }}
                    className='w-full mr-1 p-4 block text-center rounded-xl bg-green-900 hover:bg-green-700 bg-opacity-50 hover:bg-opacity-50 hover:text-gray-200 disabled:border border hover:border border-green-700 hover:border-green-700'
                  >
                    Now
                  </button>
                  <button
                    onClick={() => {
                      setOpenConnect(false)
                    }}
                    className='w-full ml-1 p-4 block text-center rounded-xl bg-red-900 hover:bg-red-700 bg-opacity-50 hover:bg-opacity-50 hover:text-gray-200 disabled:border border hover:border border-red-700 hover:border-red-700'
                  >
                    Later
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : availableWallets.length == 0 ? (
          <div>
            <p className='m-2'>No wallets installed...</p>
          </div>
        ) : (
          <div className='flex flex-col min-w-[280px] w-[85%] md:w-[75%]'>
            {availableWallets.map((wallet, idx) => (
              <button
                key={`connect-wallet-${wallet.name}`}
                onClick={() => connectWallet(wallet.name)}
                disabled={connecting || connected}
                className='w-full mt-1 mx-auto py-2 px-4 flex items-center justify-start bg-gray-700 border border-gray-600 hover:text-white hover:bg-gray-600 hover:border hover:border-gray-500'
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
        title={profile ? 'Setup Profile' : 'Edit Profile'}
        open={openProfile}
        onClose={() => (!loading ? setOpenProfile(false) : null)}
        className='text-center'
      >
        <div className='flex flex-col'>
          <TextChip icon={KeyIcon} prefix='Stake Key' value={populatedWallet?.stakeKey || ''} />

          <div className='my-4 flex flex-col items-center'>
            <button
              onClick={() => alert('TODO')}
              disabled={loading}
              className='w-52 h-52 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-full bg-gray-900 border border-gray-700 text-center text-sm text-gray-400 hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
            >
              <PhotoIcon className='w-12 h-12 mx-auto' />
              <p>Profile Picture</p>
            </button>

            <input
              placeholder='Username:'
              value={profileUname}
              onChange={(e) => setProfileUname(e.target.value)}
              disabled={loading}
              className='w-full mt-1 mx-4 p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-lg bg-gray-900 border border-gray-700 text-center text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
            />
          </div>

          <div className='flex items-center justify-evenly'>
            <button
              onClick={() => updateProfile().then(() => setOpenProfile(false))}
              disabled={loading}
              className='w-full mr-1 p-4 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 block text-center rounded-xl bg-green-900 hover:bg-green-700 bg-opacity-50 hover:bg-opacity-50 hover:text-gray-200 disabled:border border hover:border border-green-700 hover:border-green-700'
            >
              Save
            </button>
            <button
              onClick={() => setOpenProfile(false)}
              disabled={loading}
              className='w-full ml-1 p-4 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 block text-center rounded-xl bg-red-900 hover:bg-red-700 bg-opacity-50 hover:bg-opacity-50 hover:text-gray-200 disabled:border border hover:border border-red-700 hover:border-red-700'
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </Fragment>
  )
}

export default Profile
