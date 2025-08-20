import Image from 'next/image'
import React from 'react'

function Navbar() {
  return (
    <div className='flex items-center justify-center bg-white p-4 shadow-md h-[0vh]'>
        <Image src="/assets/ush_logo_dark.svg" alt="Logo" width={120} height={120} />
    </div>
  )
}

export default Navbar