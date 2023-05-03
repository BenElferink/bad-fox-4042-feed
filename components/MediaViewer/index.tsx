'use client'
import type { MediaType } from '@/@types'
import Video360 from './Video360'
import MusicPlayer from './MusicPlayer'

const MediaViewer = (props: { type: MediaType; src: string }) => {
  const { type, src } = props

  return (
    <div className='flex items-center justify-center'>
      {type === 'music' ? (
        <MusicPlayer src={src} />
      ) : type === 'image' ? (
        <img src={src} alt='' className='rounded-lg' />
      ) : type === 'video' ? (
        <video src={src} controls className='rounded-lg' />
      ) : type === '360 video' ? (
        <Video360 src={src} />
      ) : null}
    </div>
  )
}

export default MediaViewer
