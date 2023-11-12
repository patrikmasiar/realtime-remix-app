import Chat from '../Chat'
import stylesheet from "../tailwind.css";
import type {LinksFunction} from "@remix-run/node";
import Login from '../Login'
import AppContextProvider, { useAppContext } from "~/context";
import Playground from "~/Playground";


export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const App = () => {
  const {user, users, submitMessage, messages, logout, login, loading} = useAppContext()

  if (loading) {
    return <div>Loading...</div>
  }

  if (user) {
    return (
      <div className="flex min-h-full flex-col">
        <header className="shrink-0 bg-gray-900">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-x-8">
              <a href="#" className="-m-1.5 p-1.5 text-white">
                <div className="isolate flex -space-x-2">
                  {users.map(user => (
                    <img
                      key={user.local_id}
                      className="relative z-20 inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ))}
                </div>
              </a>
            </div>
            <div className="text-white cursor-pointer" onClick={logout}>
              Logout
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl grow lg:flex xl:px-2">
          <div className="flex-1 xl:flex">
            <div className="px-4 py-6 sm:px-6 xl:flex-1">
              <Playground />
            </div>
          </div>
          <div className="shrink-0 border-t border-gray-200 px-4 py-6 sm:px-6 lg:w-96 lg:border-l lg:border-t-0 lg:pr-8 xl:pr-6">
            <Chat
              messages={messages}
              onSubmit={submitMessage}
            />
          </div>
        </div>
      </div>
    )
  }

  return <Login
    onSubmit={login}
  />
}

export default function Example() {
  return (
    <AppContextProvider>
      <App />
    </AppContextProvider>
  )

}
