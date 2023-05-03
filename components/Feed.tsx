import dynamic from 'next/dynamic'
import { Fragment, useEffect, useState } from 'react'
import { useRender } from '@/contexts/RenderContext'
import fetchFeed from '@/functions/fetchFeed'
import fetchProfiles from '@/functions/fetchProfiles'
import ProfilePicture from './ProfilePicture'
import type { ExtendedFeedItem, Profile } from '@/@types'

const MediaViewer = dynamic(() => import('./MediaViewer'), { ssr: false })

const Feed = () => {
  const { reRender } = useRender()

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

  return (
    <div className='mt-4'>
      {loading ? (
        <p>Fetching posts...</p>
      ) : !feed.length ? (
        <p>No posts yet 🥲</p>
      ) : (
        feed.map((item) => (
          <div key={`post-${item.id}`} className='flex w-[80vw] max-w-[690px] mb-4 p-2 rounded-xl bg-gray-400 bg-opacity-20'>
            <div className='mr-2'>
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
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Feed
