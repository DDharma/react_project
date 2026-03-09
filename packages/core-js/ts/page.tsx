import Image from 'next/image'

export default function Home() {

  //creating type
  type User = {
    name: string,
    email: string,
    isActive: boolean
  }

  type UserNew = {
    readonly _id: string, //this is only read not be able to change
    name: string,
    email: string,
    isActive: boolean
    credCard?: string //this is optional
  }


  const userFunction = (user: User): User => {
    return user
  }
  console.log(userFunction({ name: 'John', email: 'a@123.com', isActive: true }))
  // console.log(userFunction({name: 'John', email: 'a@123.com',isActive:true}))

  let myUser : UserNew = {
    _id: "hello@gmail.com",
    name: "Dharama",
    email: "123@gmail.com",
    isActive: true
  }
  // myUser._id = "hello@gmail1.com"  gives error _id is read only
  console.log(myUser)

  const variable: string = "hello world"
  console.log(variable)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div></div>
    </main>
  )
}
