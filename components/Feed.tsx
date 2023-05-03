import dynamic from 'next/dynamic'
import { Fragment, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { firestore, storage } from '@/utils/firebase'
import { ChatBubbleLeftEllipsisIcon, HeartIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useWallet } from '@/contexts/WalletContext'
import { useRender } from '@/contexts/RenderContext'
import fetchFeed from '@/functions/fetchFeed'
import fetchProfiles from '@/functions/fetchProfiles'
import ProfilePicture from './ProfilePicture'
import { POSTS_DB_PATH } from '@/constants'
import type { ExtendedFeedItem, FeedItem, Profile } from '@/@types'

const MediaViewer = dynamic(() => import('./MediaViewer'), { ssr: false })

const Feed = () => {
  const { reRender } = useRender()
  const { populatedWallet } = useWallet()

  const [loading, setLoading] = useState(false)
  const [feed, setFeed] = useState<ExtendedFeedItem[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)

        const _profiles = await fetchProfiles()
        const _feed = await fetchFeed()

        setProfiles(_profiles)
        setFeed(
          _feed.map((item) => ({
            ...item,
            pfp: _profiles.find((prof) => prof.stakeKey === item.stakeKey)?.pfp,
          }))
        )
      } catch (error: any) {
        console.error(error.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [reRender])

  const getDateString = (timestamp: number) => {
    const date = new Date(timestamp)
    const dateStr = date.toDateString()
    const dateStrSplitted = dateStr.split(' ')

    dateStrSplitted.shift()
    dateStrSplitted.pop()

    return dateStrSplitted.join(' ')
  }

  const likePost = async (postId: string) => {
    try {
      setLoading(true)
      toast.success('Processing')
      throw new Error('in development..!')

      toast.dismiss()
      toast.success('Done')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const commentPost = async (postId: string) => {
    try {
      setLoading(true)
      toast.success('Processing')
      throw new Error('in development..!')

      toast.dismiss()
      toast.success('Done')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this post?')) {
      try {
        setLoading(true)
        toast.loading('Deleting...')

        const post = feed.find((item) => item.id === postId) as FeedItem
        const mediaUrl = post?.media?.url

        if (mediaUrl) {
          const fileId = mediaUrl.split('?')[0].split('%2F4042%2F')[1]
          await storage.ref(`/tools/4042/${fileId}`).delete()
        }

        const collection = firestore.collection(POSTS_DB_PATH)
        await collection.doc(postId).delete()

        setFeed((prev) => prev.filter((item) => item.id !== postId))

        toast.dismiss()
        toast.success('Deleted!')
      } catch (error: any) {
        toast.dismiss()
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className='mt-4'>
      {!feed.length ? (
        loading ? (
          <p>Fetching posts...</p>
        ) : (
          <p>No posts yet 🥲</p>
        )
      ) : (
        feed.map((item) => (
          <div
            key={`post-${item.id}`}
            className='flex w-[80vw] max-w-[690px] mb-4 p-2 rounded-xl bg-gray-400 bg-opacity-20'
          >
            <div className='mr-2 w-[50px] flex flex-col items-center'>
              <ProfilePicture src={item.pfp} size={50} />
              <p className='mt-1 text-xs text-center'>{getDateString(item.timestamp)}</p>
            </div>

            <div className='w-full flex flex-col justify-center'>
              {item.text ? (
                <p className='w-full mb-2 p-3 text-sm text-gray-200 rounded-lg bg-gray-400 bg-opacity-20'>
                  {item.text.split('\n').map((str, idx) => (
                    <Fragment key={`post-${item.id}-str-${idx}`}>
                      {idx > 0 ? <br /> : null}
                      {str}
                    </Fragment>
                  ))}
                </p>
              ) : null}

              <MediaViewer type={item.media.type} src={item.media.url} />

              <div className='flex items-center'>
                <button
                  disabled={loading}
                  onClick={() => likePost(item.id)}
                  className='flex items-center mt-2 mx-2 text-gray-400 hover:text-gray-200'
                >
                  <HeartIcon className='w-6 h-6' />
                  <span className='ml-2'>{item.likes.length}</span>
                </button>

                <button
                  disabled={loading}
                  onClick={() => commentPost(item.id)}
                  className='flex items-center mt-2 mx-2 text-gray-400 hover:text-gray-200'
                >
                  <ChatBubbleLeftEllipsisIcon className='w-6 h-6' />
                  <span className='ml-2'>{item.comments.length}</span>
                </button>

                {item.stakeKey === populatedWallet?.stakeKey ? (
                  <button
                    disabled={loading}
                    onClick={() => deletePost(item.id)}
                    className='flex items-center mt-2 mx-2 text-gray-400 hover:text-red-400 disabled:text-gray-400 disabled:opacity-50'
                  >
                    <TrashIcon className='w-6 h-6' />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Feed
