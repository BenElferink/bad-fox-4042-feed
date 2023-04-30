import { Fragment, useEffect, useState } from 'react'
import { firestore } from '@/utils/firebase'
import ProfilePicture from './ProfilePicture'
import { POSTS_DB_PATH, PROFILES_DB_PATH } from '@/constants'
import type { ExtendedFeedItem, FeedItem, Profile } from '@/@types'
import { useReRender } from '@/contexts/ReRenderContext'

const fetchProfiles = async () => {
  const collection = firestore.collection(PROFILES_DB_PATH)
  const collectionQuery = await collection.get()

  const docs = collectionQuery.docs.map((doc) => {
    const data = doc.data() as Profile

    return {
      ...data,
      id: doc.id,
    }
  })

  return docs
}

const fetchFeed = async () => {
  const collection = firestore.collection(POSTS_DB_PATH)
  const collectionQuery = await collection.orderBy('timestamp', 'desc').get()

  const docs = collectionQuery.docs.map((doc) => {
    const data = doc.data() as FeedItem

    return {
      ...data,
      id: doc.id,
    }
  })

  return docs
}

const Feed = () => {
  const { reRender } = useReRender()

  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [feed, setFeed] = useState<ExtendedFeedItem[]>([])

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

  return (
    <div className='mt-4'>
      {loading ? (
        <p>Fetching posts...</p>
      ) : !feed.length ? (
        <p>No posts yet 🥲</p>
      ) : (
        feed.map((item) => (
          <div
            key={`post-${item.id}`}
            className='flex w-[80vw] md:w-[500px] mb-4 p-2 bg-gray-400 bg-opacity-20 rounded-xl'
          >
            <div className='mr-2'>
              <ProfilePicture src={item.pfp} size={50} />
              <p className='mt-1 text-xs text-center'>{getDateString(item.timestamp)}</p>
            </div>

            <div className='w-full'>
              <p className='w-full p-3 text-sm text-gray-400 rounded-lg bg-gray-900'>
                {item.text.split('\n').map((str, idx) => (
                  <Fragment key={`post-${item.id}-str-${idx}`}>
                    {idx > 0 ? <br /> : null}
                    {str}
                  </Fragment>
                ))}
              </p>

              <div>
                {item.media.type === 'image' ? (
                  <img src={item.media.url} alt='' />
                ) : item.media.type === 'video' ? (
                  <video src={item.media.url} controls />
                ) : item.media.type === 'music' ? (
                  <audio src={item.media.url} controls />
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
