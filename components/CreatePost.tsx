import { Fragment, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-hot-toast'
import { MusicalNoteIcon, PhotoIcon, VideoCameraIcon, ViewfinderCircleIcon } from '@heroicons/react/24/solid'
import { firebase, firestore, storage } from '@/utils/firebase'
import { useWallet } from '@/contexts/WalletContext'
import { useReRender } from '@/contexts/ReRenderContext'
import ProfilePicture from './ProfilePicture'
import { POSTS_DB_PATH } from '@/constants'
import type { MediaType } from '@/@types'

const CreatePost = () => {
  const { populatedWallet, profile } = useWallet()
  const { setReRender } = useReRender()

  const [text, setText] = useState('')
  const [mediaType, setMediaType] = useState<MediaType | ''>('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const getFileLink = async (fileId: string) => {
    const refList = await storage.ref('/tools/4042').listAll()

    for await (const item of refList.items) {
      if (item.name === fileId) return await item.getDownloadURL()
    }
  }

  const uploadFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const fileId = uuidv4()
      const uploadTask = storage.ref(`/tools/4042/${fileId}`).put(file, {
        contentType: file.type,
      })

      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setProgress(percent)
        },
        (error) => {
          setProgress(0)
          reject(error?.message || error)
        },
        () => {
          setProgress(0)
          getFileLink(fileId).then((fileUrl) => resolve(fileUrl as string))
        }
      )
    })

  const handleFile = (type: MediaType, file: File) => {
    const sizeLimit = 1e9 // 1gb

    if (file.size > sizeLimit) {
      const msg = 'File size is limited to 1gb'
      toast.error(msg)

      setMediaType('')
      setMediaFile(null)
    } else {
      setMediaType(type)
      setMediaFile(file)
    }
  }

  const clickPost = async () => {
    try {
      setLoading(true)
      toast.loading('Uploading...')

      const collection = firestore.collection(POSTS_DB_PATH)

      let mediaUrl = ''
      if (mediaFile) {
        mediaUrl = await uploadFile(mediaFile)
      }

      const response = await fetch('/api/timestamp')
      const { timestamp } = await response.json()

      await collection.add({
        timestamp,
        stakeKey: populatedWallet?.stakeKey,
        text,
        media: {
          type: mediaType,
          url: mediaUrl,
        },
        likes: [],
        comments: [],
      })

      setText('')
      setMediaType('')
      setMediaFile(null)
      setReRender((prev) => prev + 1)

      toast.dismiss()
      toast.success('Uploaded!')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Fragment>
      <div className='flex w-[80vw] md:w-[500px] mt-4 p-2 bg-gray-400 bg-opacity-20 rounded-xl'>
        <div className='mr-2'>
          <ProfilePicture src={profile?.pfp} size={50} />
        </div>

        <div className='w-full'>
          <textarea
            placeholder='Description (optional)'
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            className='w-full p-3 disabled:text-gray-600 disabled:placeholder:text-gray-600 disabled:border-0 disabled:bg-gray-900 disabled:bg-opacity-50 disabled:cursor-not-allowed border border-transparent rounded-lg bg-gray-900 text-sm hover:text-white hover:placeholder:text-white hover:border-gray-500 hover:bg-gray-700'
          />

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              {[
                {
                  Icon: MusicalNoteIcon,
                  type: 'music' as MediaType,
                  accept: '.mp3,.wav',
                },
                {
                  Icon: PhotoIcon,
                  type: 'image' as MediaType,
                  accept: '.jpg,.jpeg,.png,.webp',
                },
                {
                  Icon: VideoCameraIcon,
                  type: 'video' as MediaType,
                  accept: '.mp4,.mov,.avi,.m4v,.wmv,.webm',
                },
                {
                  Icon: ViewfinderCircleIcon,
                  type: '360 video' as MediaType,
                  accept: '.mp4,.mov,.avi,.m4v,.wmv,.webm',
                },
              ].map((item, idx) => (
                <button
                  key={`select-${item.type}-file`}
                  type='button'
                  title={`Select "${item.type}" file`}
                  onClick={() => {}}
                  disabled={loading}
                  className={
                    (idx === 0 ? ' mr-1 ' : idx === 2 ? ' ml-1 ' : ' mx-1 ') +
                    (mediaType === item.type
                      ? ' text-sm border border-gray-500 rounded-lg bg-gray-700 hover:text-white '
                      : ' text-sm border border-transparent rounded-lg bg-gray-900 hover:text-white hover:border-gray-500 hover:bg-gray-700 ') +
                    'relative p-3 flex items-center cursor-pointer disabled:text-gray-600 disabled:border-0 disabled:bg-gray-900 disabled:bg-opacity-50 disabled:cursor-not-allowed'
                  }
                >
                  <input
                    type='file'
                    accept={item.accept}
                    multiple={false}
                    disabled={loading}
                    onChange={async (e) => {
                      const file = (e.target.files as FileList)[0]
                      if (!file) return

                      handleFile(item.type, file)
                    }}
                    className='absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed'
                  />
                  <item.Icon className='w-5 h-5 cursor-pointer disabled:cursor-not-allowed' />
                </button>
              ))}
            </div>

            <button
              onClick={clickPost}
              disabled={loading || (!text && !mediaType)}
              className='ml-1 p-3 flex items-center cursor-pointer disabled:text-gray-600 disabled:border-0 disabled:bg-gray-900 disabled:bg-opacity-50 disabled:cursor-not-allowed text-sm border border-transparent rounded-lg bg-gray-900 hover:text-white hover:border-gray-500 hover:bg-gray-700'
            >
              POST
            </button>
          </div>

          {progress ? (
            <div className='w-full h-fit mt-2 bg-transparent rounded-full'>
              <div className='leading-4 rounded-full bg-opacity-70 bg-blue-500' style={{ width: `${progress}%` }}>
                <span className='ml-2 whitespace-nowrap text-[11px] text-blue-200'>
                  Uploading {progress.toFixed(1)}%
                </span>
              </div>
            </div>
          ) : mediaFile ? (
            <p className='mt-2 text-sm text-gray-400'>{mediaFile.name}</p>
          ) : null}
        </div>
      </div>

      <div className='w-3/4 h-0.5 mt-4 mx-auto rounded-full bg-gray-400' />
    </Fragment>
  )
}

export default CreatePost
