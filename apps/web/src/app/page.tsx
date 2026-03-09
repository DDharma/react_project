import Link from 'next/link'

const routes = [
  { section: 'Machine Coding', items: [
    { name: 'Stepper', href: '/steper' },
    { name: 'Calendar', href: '/calender' },
    { name: 'File Explorer', href: '/file-explorer' },
    { name: 'Infinite Scroll', href: '/infinite-scroll' },
    { name: 'Live Comment', href: '/live-comment' },
    { name: 'Search', href: '/search' },
    { name: 'Select Box', href: '/selectbox' },
    { name: 'Stopwatch', href: '/stopwatch' },
    { name: 'Tabs', href: '/tabs' },
    { name: 'Voting', href: '/voting' },
    { name: 'Voting Queue', href: '/voting-queue' },
    { name: 'Test 1', href: '/test1' },
  ]},
  { section: 'Filesystem', items: [
    { name: 'Folder Tree', href: '/folder-tree' },
    { name: 'OTP', href: '/otp' },
    { name: 'JS Examples', href: '/js-examples' },
  ]},
  { section: 'State Management', items: [
    { name: 'Redux Demo', href: '/redux' },
  ]},
  { section: 'TypeScript', items: [
    { name: 'TS Types', href: '/ts-types' },
  ]},
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Frontend Interview Prep</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {routes.map(({ section, items }) => (
          <div key={section}>
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">{section}</h2>
            <ul className="space-y-2">
              {items.map(({ name, href }) => (
                <li key={href}>
                  <Link href={href} className="text-white/80 hover:text-white hover:underline">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  )
}
