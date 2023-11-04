import Chat from '~/Chat'
import stylesheet from "~/tailwind.css";
import {LinksFunction} from "@remix-run/node";
import {useState} from "react";
import Login from '~/Login'

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function Example() {
  const [user, setUser] = useState('')

  if (user.length) {
    return (
      <div className="flex min-h-full flex-col">
      <header className="shrink-0 bg-gray-900">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-x-8">
            <a href="#" className="-m-1.5 p-1.5 text-white">
              <span>{user}</span>
            </a>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl grow lg:flex xl:px-2">
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 xl:flex-1">
          </div>
        </div>
        <div className="shrink-0 border-t border-gray-200 px-4 py-6 sm:px-6 lg:w-96 lg:border-l lg:border-t-0 lg:pr-8 xl:pr-6">
          <Chat />
        </div>
      </div>
    </div>
    )
  }

  return <Login
    onSubmit={setUser}
  />
}
