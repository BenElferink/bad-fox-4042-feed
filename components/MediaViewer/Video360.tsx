import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'

const VideoSphere = (props: { video: HTMLVideoElement; videoTexture: THREE.VideoTexture }) => {
  const { video, videoTexture } = props

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

    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  useMemo(() => {
    const controls = new OrbitControls(camera, domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false

    controlsRef.current = controls
    return () => {
      controls.dispose()
      controlsRef.current = null
    }
  }, [camera, domElement])

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

  const video = useMemo(() => {
    const vid = document.createElement('video')
    vid.src = src.replace('https://firebasestorage.googleapis.com', '/storage')
    vid.crossOrigin = 'anonymous'
    vid.loop = true
    vid.muted = true
    vid.setAttribute('webkit-playsinline', 'true')
    vid.setAttribute('playsinline', 'true')
    vid.play()
    return vid
  }, [src])

  const videoTexture = useMemo(() => new THREE.VideoTexture(video), [video])

  return (
    <div className='w-full h-[420px]'>
      <Canvas>
        <VideoSphere video={video} videoTexture={videoTexture} />
      </Canvas>
    </div>
  )
}

export default Video360
