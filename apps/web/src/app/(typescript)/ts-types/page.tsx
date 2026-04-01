import { log } from "console"

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

  let myUser : UserNew = {
    _id: "hello@gmail.com",
    name: "Dharama",
    email: "123@gmail.com",
    isActive: true
  }
  // myUser._id = "hello@gmail1.com"  gives error _id is read only
  console.log(myUser)

  // Generics
  function identity<R>(arg: R): R {
    return (arg);
  }

  log(identity<Number>(3)) // Output: Hello Generics!


  const variable: string = "hello world"
  console.log(variable)
  return (
    <div className="bg-black min-h-screen flex flex-col items-center p-10 text-white"></div>
  )
}
