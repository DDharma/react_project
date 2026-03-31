'use client'
import React, { useState, useMemo, useCallback } from 'react'

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

const PAGE_SIZE = 5

const columns: { key: keyof User; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'age', label: 'Age' },
]

const DataTablePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof User>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }, [])

  const handleSort = useCallback((field: keyof User) => {
    if (field === sortBy) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }, [sortBy])

  const sortedUsers = useMemo(() => {
    const term = searchTerm.toLowerCase()
    const filtered = users.filter(
      user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    )
    return filtered.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1
      if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [searchTerm, sortBy, sortOrder])

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE))
  const paginatedUsers = useMemo(
    () => sortedUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sortedUsers, currentPage]
  )

  const sortIndicator = (key: keyof User) =>
    sortBy === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''

  return (
    <div className="bg-black min-h-screen flex flex-col items-center p-10 text-white">
      <h1 className="text-2xl font-bold mb-6">Data Table</h1>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-6 px-4 py-2 w-full max-w-md rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
      />

      <div className="w-full max-w-3xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left cursor-pointer select-none hover:text-blue-400 transition-colors"
                >
                  {col.label}{sortIndicator(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                  <td className="px-4 py-3">{user.id}</td>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.age}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span className="text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default DataTablePage
