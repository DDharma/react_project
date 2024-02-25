import Image from 'next/image'
import Steper from './_components/steper/Steper'
import MultiselectSearch from './_components/multiselectSearch/MultiselectSearch'

const steps = [
  {
    id:1,
    name:"step1"
  },
  {
    id:2,
    name:"step2"
  },
  {
    id:3,
    name:"step3"
  },
  {
    id:4,
    name:"step4"
  }
]

export default function Home() {
  return (
    <>
      <div className='h-[60px] bg-gray-400 flex justify-center items-center mb-[20px]'>
        <div className='uppercase text-white text-[24px] font-bold'>complete your process</div>
      </div>
      <Steper stepData={steps}/>
      <div className='h-[60px] bg-gray-400 flex justify-center items-center mb-[20px] mt-[50px]'>
        <div className='uppercase text-white text-[24px] font-bold'>multiselect search</div>
      </div>
      <MultiselectSearch/>
    </>
  )
}
