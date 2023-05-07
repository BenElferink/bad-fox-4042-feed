import dynamic from 'next/dynamic'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { firebase, firestore, storage } from '@/utils/firebase'
import {
  ChatBubbleLeftEllipsisIcon as ChatOutline,
  HeartIcon as HeartOutline,
  TrashIcon as TrashOutline,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useWallet } from '@/contexts/WalletContext'
import { useRender } from '@/contexts/RenderContext'
import fetchFeed from '@/functions/fetchFeed'
import fetchProfiles from '@/functions/fetchProfiles'
import ProfilePicture from './ProfilePicture'
import { POSTS_DB_PATH } from '@/constants'
import type { ExtendedComment, ExtendedFeedItem, FeedItem, Profile } from '@/@types'
import Modal from './layout/Modal'

const MediaViewer = dynamic(() => import('./MediaViewer'), { ssr: false })

const Feed = () => {
  const { populatedWallet, profile } = useWallet()
  const { reRender, setReRender } = useRender()

  const [loading, setLoading] = useState(false)
  const [feed, setFeed] = useState<ExtendedFeedItem[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])

  const [selectedPostId, setSelectedPostId] = useState('')
  const [text, setText] = useState('')

  const comments = useMemo(() => {
    const found = feed.find((post) => post.id === selectedPostId)

    if (!found) {
      return []
    }

    return found.comments
  }, [feed, selectedPostId])

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)

        const _profiles = await fetchProfiles()
        const _feed = await fetchFeed()

        setProfiles(_profiles)
        setFeed(
          _feed.map((post) => {
            const postProfile = _profiles.find((prof) => prof.stakeKey === post.stakeKey)

            return {
              ...post,
              pfp: postProfile?.pfp || '',
              comments: post.comments
                .map((comm) => {
                  const commentProfile = _profiles.find((prof) => prof.stakeKey === comm.stakeKey)

                  return {
                    ...comm,
                    pfp: commentProfile?.pfp || '',
                    uname: commentProfile?.uname || '',
                  }
                })
                .sort((a, b) => b.timestamp - a.timestamp),
            }
          })
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
      toast.loading('Processing')

      const stakeKey = populatedWallet?.stakeKey || ''

      const collection = firestore.collection(POSTS_DB_PATH)
      const doc = await collection.doc(postId).get()
      const alreadyLiked = !!(doc.data() as FeedItem).likes.find((sKey) => sKey === stakeKey)

      const { FieldValue } = firebase.firestore
      await collection.doc(postId).update({
        likes: alreadyLiked ? FieldValue.arrayRemove(stakeKey) : FieldValue.arrayUnion(stakeKey),
      })

      setReRender((prev) => prev + 1)

      toast.dismiss()
      toast.success('Done')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async () => {
    try {
      setLoading(true)
      toast.loading('Processing')

      const stakeKey = populatedWallet?.stakeKey || ''

      const { FieldValue } = firebase.firestore
      const collection = firestore.collection(POSTS_DB_PATH)

      const response = await fetch('/api/timestamp')
      const { timestamp } = await response.json()

      await collection.doc(selectedPostId).update({
        comments: FieldValue.arrayUnion({
          timestamp,
          stakeKey,
          text,
        }),
      })

      setText('')
      setReRender((prev) => prev + 1)

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

        const post = feed.find((post) => post.id === postId) as FeedItem
        const mediaUrl = post?.media?.url

        if (mediaUrl) {
          const fileId = mediaUrl.split('?')[0].split('%2F4042%2F')[1]
          await storage.ref(`/tools/4042/${fileId}`).delete()
        }

        const collection = firestore.collection(POSTS_DB_PATH)
        await collection.doc(postId).delete()

        setFeed((prev) => prev.filter((post) => post.id !== postId))

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

  const deleteComment = async (comment: ExtendedComment) => {
    if (window.confirm('Are you sure you want to permanently delete this comment?')) {
      try {
        setLoading(true)
        toast.loading('Processing')

        const { FieldValue } = firebase.firestore
        const collection = firestore.collection(POSTS_DB_PATH)

        comment.uname = undefined
        comment.pfp = undefined

        delete comment.uname
        delete comment.pfp

        await collection.doc(selectedPostId).update({
          comments: FieldValue.arrayRemove(comment),
        })

        setReRender((prev) => prev + 1)

        toast.dismiss()
        toast.success('Done')
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
        feed.map((post) => {
          const iLiked = post.likes.find((sKey) => sKey === populatedWallet?.stakeKey)

          return (
            <div
              key={`post-${post.id}`}
              className='flex w-[80vw] max-w-[690px] mb-4 p-2 rounded-xl bg-gray-400 bg-opacity-20'
            >
              <div className='mr-2 w-[50px] flex flex-col items-center'>
                <ProfilePicture src={post.pfp} size={50} />
                <p className='mt-1 text-xs text-center'>{getDateString(post.timestamp)}</p>
              </div>

              <div className='w-full flex flex-col justify-center'>
                {post.text ? (
                  <p className='w-full mb-2 p-3 text-sm text-gray-200 rounded-lg bg-gray-400 bg-opacity-20'>
                    {post.text.split('\n').map((str, idx) => (
                      <Fragment key={`post-${post.id}-str-${idx}`}>
                        {idx > 0 ? <br /> : null}
                        {str}
                      </Fragment>
                    ))}
                  </p>
                ) : null}

                <MediaViewer type={post.media.type} src={post.media.url} />

                <div className='flex items-center'>
                  <button
                    disabled={loading}
                    onClick={() => likePost(post.id)}
                    className={
                      'flex items-center mt-2 mx-2 hover:text-gray-200 ' +
                      (iLiked ? 'text-red-400' : 'text-gray-400')
                    }
                  >
                    {iLiked ? <HeartSolid className='w-6 h-6' /> : <HeartOutline className='w-6 h-6' />}
                    <span className='ml-2'>{post.likes.length}</span>
                  </button>

                  <button
                    disabled={loading}
                    onClick={() => setSelectedPostId(post.id)}
                    className='flex items-center mt-2 mx-2 text-gray-400 hover:text-gray-200 '
                  >
                    <ChatOutline className='w-6 h-6' />
                    <span className='ml-2'>{post.comments.length}</span>
                  </button>

                  {post.stakeKey === populatedWallet?.stakeKey ? (
                    <button
                      disabled={loading}
                      onClick={() => deletePost(post.id)}
                      className='flex items-center mt-2 mx-2 text-gray-400 hover:text-gray-200 disabled:text-gray-400 disabled:opacity-50'
                    >
                      <TrashOutline className='w-6 h-6' />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })
      )}

      <Modal
        title='Comments'
        open={!!selectedPostId}
        onClose={() => (!loading ? setSelectedPostId('') : null)}
        className='text-center'
      >
        <div className='flex flex-col items-center'>
          <div className='flex w-[80vw] md:w-[500px] mt-4 p-2 bg-gray-400 bg-opacity-20 rounded-xl'>
            <div className='mr-2'>
              <ProfilePicture src={profile?.pfp} size={50} />
            </div>

            <div className='w-full'>
              <textarea
                placeholder='New comment...'
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
                className='w-full p-3 disabled:text-gray-600 disabled:placeholder:text-gray-600 disabled:border-0 disabled:bg-gray-900 disabled:bg-opacity-50 disabled:cursor-not-allowed border border-transparent rounded-lg bg-gray-900 text-sm hover:text-white hover:placeholder:text-white hover:border-gray-500 hover:bg-gray-700'
              />

              <button
                onClick={() => submitComment()}
                disabled={loading || !text}
                className='p-3 flex items-center cursor-pointer disabled:text-gray-600 disabled:border-0 disabled:bg-gray-900 disabled:bg-opacity-50 disabled:cursor-not-allowed text-sm border border-transparent rounded-lg bg-gray-900 hover:text-white hover:border-gray-500 hover:bg-gray-700'
              >
                COMMENT
              </button>
            </div>
          </div>

          {comments.length ? <div className='w-3/4 h-0.5 my-4 mx-auto rounded-full bg-gray-400' /> : null}

          {comments.map((comm, idx) => (
            <div
              key={`comment-${idx}`}
              className='flex items-start w-[80vw] max-w-[420px] mb-4 p-2 rounded-xl bg-gray-400 bg-opacity-20'
            >
              <div className='mr-2 w-[50px] flex flex-col items-center'>
                <ProfilePicture src={comm.pfp} size={50} />
                <p className='mt-1 text-xs text-center'>{getDateString(comm.timestamp)}</p>

                {comm.stakeKey === populatedWallet?.stakeKey ? (
                  <button
                    disabled={loading}
                    onClick={() => deleteComment(comm)}
                    className='flex items-center mt-1 text-gray-400 hover:text-gray-200 disabled:text-gray-400 disabled:opacity-50'
                  >
                    <TrashOutline className='w-5 h-5' />
                  </button>
                ) : null}
              </div>

              <div className='w-full'>
                <p className='pl-2 mb-2 max-w-[150px] text-start truncate'>{comm.uname || populatedWallet?.stakeKey}</p>

                <p className='p-2 text-sm text-start text-gray-200 rounded-lg bg-gray-400 bg-opacity-20'>
                  {comm.text.split('\n').map((str, i) => (
                    <Fragment key={`comment-${idx}-str-${i}`}>
                      {i > 0 ? <br /> : null}
                      {str}
                    </Fragment>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default Feed
