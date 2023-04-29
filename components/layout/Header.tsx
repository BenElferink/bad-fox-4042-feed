import Image from 'next/image'
import Profile from '../Profile'

const Header = () => {
  return (
    <header className='w-screen p-2 bg-black bg-opacity-40 flex items-center justify-between sticky top-0 z-40'>
      <div className='ml-2'>
        <Profile />
      </div>

      <div className='h-20 w-20 relative flex items-center'>
        <Image
          src='/media/logo.png'
          alt='logo'
          priority
          fill
          sizes='5rem'
          className='object-contain rounded-full'
        />
      </div>
    </header>
  )
}

export default Header
