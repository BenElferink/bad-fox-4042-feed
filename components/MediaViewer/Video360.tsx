import { useEffect, useRef } from 'react'
import { storage } from '@/utils/firebase'

// @ts-ignore
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import 'videojs-vr'
import 'videojs-vr/dist/videojs-vr.js'
import 'videojs-vr/dist/videojs-vr.css'

const Video360 = (props: { src: string }) => {
  const { src } = props
  const videoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      const videoElement = document.createElement('video-js')
      videoElement.classList.add('vjs-big-play-centered')
      videoRef.current.appendChild(videoElement)

      const fileId = src?.split('%2F4042%2F')[1]?.split('?')[0]
      if (fileId) {
        storage
          .ref(`/tools/4042/${fileId}`)
          .getMetadata()
          .then((metadata) => {
            const type = metadata.contentType

            const player = videojs(
              videoElement,
              {
                autoplay: false,
                muted: true,
                controls: true,
                responsive: true,
                fluid: true,
                sources: [
                  {
                    src,
                    type,
                  },
                ],
              },
              () => {
                videojs.log('player is ready')

                const vrPlugin = player.vr({ projection: '360' })

                vrPlugin.on('initialized', function () {
                  videojs.log('VR is initialized')
                })
              }
            )
          })
      }
    }
  }, [videoRef, src])

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  )
}

export default Video360
