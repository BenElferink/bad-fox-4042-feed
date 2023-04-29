import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer className='flex flex-col items-center justify-center pb-6 bg-black bg-opacity-40'>
      <Link
        href='https://badfoxmc.com'
        target='_blank'
        rel='noopener noreferrer'
        className='w-16 flex items-center justify-center'
      >
        <Image src='https://badfoxmc.com/media/logo/white_cropped.png' alt='logo' width={50} height={1} />
        <h5 className='ml-2 text-sm text-start whitespace-nowrap'>
          <span className='text-xs'>Powered by:</span>
          <br />
          Bad Fox MC
        </h5>
      </Link>
    </footer>
  )
}

export default Footer
