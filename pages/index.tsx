import CreatePost from '@/components/CreatePost'
import Feed from '@/components/Feed'
import type { NextPage } from 'next'

const Page: NextPage = () => {
  return (
    <div className='flex flex-col items-center'>
      <CreatePost />
      <Feed />
    </div>
  )
}

export default Page
