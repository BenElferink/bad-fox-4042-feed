import { MediaType } from '@/@types'
import React from 'react'

const MediaViewer = (props: { type: MediaType; src: string }) => {
  const { type, src } = props

  return (
    <div>
      {type === 'music' ? (
        <audio src={src} controls />
      ) : type === 'image' ? (
        <img src={src} alt='' className='rounded-lg' />
      ) : type === 'video' ? (
        <video src={src} controls className='rounded-lg' />
      ) : type === '360 video' ? (
        <video src={src} controls className='rounded-lg' />
      ) : null}
    </div>
  )
}

export default MediaViewer
