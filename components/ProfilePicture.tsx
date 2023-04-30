const ProfilePicture = (props: { src?: string; size?: number }) => {
  const { src, size = 50 } = props

  return (
    <img
      src={src || 'https://badfoxmc.com/media/logo/white_filled.png'}
      alt='pfp'
      width={size}
      height={size}
      className='border border-gray-400 rounded-full'
    />
  )
}

export default ProfilePicture
