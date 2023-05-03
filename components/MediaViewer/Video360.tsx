import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import Modal from '../layout/Modal'
import Image from 'next/image'

const VideoSphere = (props: { video: HTMLVideoElement; videoTexture: THREE.VideoTexture; controls?: boolean }) => {
  const { video, videoTexture, controls = false } = props

  const sphereRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null>(null)
  const videoRef = useRef<THREE.VideoTexture | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)

  const {
    camera,
    gl: { domElement },
  } = useThree()

  useFrame(() => {
    if (videoRef.current && sphereRef.current) {
      // @ts-ignore
      sphereRef.current.material.map.needsUpdate = true
    }

    const _controls = controlsRef.current
    if (_controls) _controls.update()
  })

  useMemo(() => {
    const _controls = new OrbitControls(camera, domElement)
    _controls.enableDamping = true
    _controls.dampingFactor = 0.05
    _controls.enableZoom = false
    _controls.autoRotate = !controls
    _controls.rotateSpeed = !controls ? 0.1 : 1
    _controls.enabled = controls

    controlsRef.current = _controls
    return () => {
      _controls.dispose()
      controlsRef.current = null
    }
  }, [camera, domElement, controls])

  return (
    <mesh ref={sphereRef}>
      <sphereBufferGeometry args={[500, 60, 60]} />
      <meshBasicMaterial map={videoTexture} side={THREE.BackSide} />
      <videoTexture ref={videoRef} args={[video]} />
    </mesh>
  )
}

const Video360 = (props: { src: string }) => {
  const { src } = props
  const [play, setPlay] = useState(false)

  const video = useMemo(() => {
    const vid = document.createElement('video')
    vid.classList.add('rounded-lg')

    vid.src = src.replace('https://firebasestorage.googleapis.com', '/storage')
    vid.crossOrigin = 'anonymous'
    vid.loop = false
    vid.muted = false
    vid.setAttribute('webkit-playsinline', 'true')
    vid.setAttribute('playsinline', 'true')
    return vid
  }, [src])

  useEffect(() => {
    if (video) {
      if (play) {
        video.play()
      } else {
        video.pause()
      }
    }
  }, [video, play])

  const videoTexture = useMemo(() => new THREE.VideoTexture(video), [video])

  if (play) {
    return (
      <Modal title='360 View (drag screen)' open={play} onClose={() => setPlay(false)}>
        <div className='w-screen h-screen md:w-[80vw] md:h-[70vh]'>
          <Canvas className='rounded-lg'>
            <VideoSphere video={video} videoTexture={videoTexture} controls />
          </Canvas>
        </div>
      </Modal>
    )
  }

  return (
    <button onClick={() => setPlay((prev) => true)} className='relative w-full h-[300px]'>
      <Image
        src='/media/360.png'
        alt=''
        width={200}
        height={100}
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 drop-shadow-vrLogo'
      />

      <Canvas className='rounded-lg'>
        <VideoSphere video={video} videoTexture={videoTexture} />
      </Canvas>
    </button>
  )
}

export default Video360
