function TextChip({
  icon: Icon,
  prefix,
  value,
}: {
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string | undefined
      titleId?: string | undefined
    } & React.RefAttributes<SVGSVGElement>
  >
  prefix: string
  value: string
}) {
  return (
    <div className='flex items-center max-w-72 p-2 bg-gray-900 rounded-lg border border-gray-700'>
      <Icon className='w-5 h-5 mr-1' />
      <p className='bg-transparent text-start text-sm truncate'>
        {prefix ? <strong>{`${prefix}: `}</strong> : null}
        {value}
      </p>
    </div>
  )
}

export default TextChip
