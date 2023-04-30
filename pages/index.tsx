import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import CreatePost from '@/components/CreatePost'
import Feed from '@/components/Feed'
import { POLICY_ID_42_CHAIN, POLICY_ID_MUSIC_ALBUM } from '@/constants'
import type { NextPage } from 'next'

const Page: NextPage = () => {
  const { populatedWallet } = useWallet()

  if (populatedWallet?.is4042) {
    return (
      <div className='flex flex-col items-center'>
        <CreatePost />
        <Feed />
      </div>
    )
  }

  if (populatedWallet?.isHolder) {
    return (
      <div className='flex flex-col items-center'>
        <Feed />
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center'>
      <div className='flex flex-col items-center text-center'>
        <p className='mt-10'>
          <strong className='text-lg'>You cannot access this page because it is token-gated.</strong>
        </p>
        <p className='mb-2'>You must own at least 1 of the following policies:</p>

        <Link
          href={`https://jpg.store/collection/${POLICY_ID_42_CHAIN}`}
          target='_blank'
          rel='noopener noreferrer'
          className='my-0.5 text-xs hover:text-blue-400 hover:underline'
        >
          {POLICY_ID_42_CHAIN}
        </Link>
        <Link
          href={`https://jpg.store/collection/${POLICY_ID_MUSIC_ALBUM}`}
          target='_blank'
          rel='noopener noreferrer'
          className='my-0.5 text-xs hover:text-blue-400 hover:underline'
        >
          {POLICY_ID_MUSIC_ALBUM}
        </Link>
      </div>
    </div>
  )
}

export default Page
