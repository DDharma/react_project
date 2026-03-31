'use client'
import React, { useState } from 'react'

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

 const users: User[] = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", age: 28 },
    { id: 2, name: "Bob Smith", email: "bob@example.com", age: 34 },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", age: 22 },
    { id: 4, name: "Diana Prince", email: "diana@example.com", age: 30 },
    { id: 5, name: "Edward Norton", email: "edward@example.com", age: 45 },
    { id: 6, name: "Fiona Apple", email: "fiona@example.com", age: 26 },
    { id: 7, name: "George Martin", email: "george@example.com", age: 38 },
    { id: 8, name: "Hannah Lee", email: "hannah@example.com", age: 31 },
    { id: 9, name: "Ivan Petrov", email: "ivan@example.com", age: 29 },
    { id: 10, name: "Julia Roberts", email: "julia@example.com", age: 41 },
  ]


const page = () => {

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortBy, setSortBy] = useState<keyof User>('name')
  const [sortOrder,setSortOrder] = useState< 'asc' | 'desc' >('asc')
  const [currentPage,setCurrentPage] = useState<number>(1)

  const page_size:number = 5
  





 


  return (
    <div className='bg-black min-h-[100vh] flex flex-col justify-start items-center'>
        <h1 className='text-white p-10'>Data table</h1>
    </div>
  )
}

export default page
