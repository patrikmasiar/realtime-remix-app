import type { FC} from "react";
import {createContext, useContext, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import { supabaseClient as supabase } from "~/utils/supabase";
import type {Message, User} from "~/types";
import AppConfig from "~/config";
import {getRandomAvatarUrl} from '~/utils/avatar';

const AppContext = createContext<{
  loading: boolean;
  user: User | null;
  users: User[];
  messages: Message[];
  login: (name: string) => void;
  logout: () => void;
  submitMessage: (message: string) => void;
}>({
  loading: false,
  user: null,
  users: [],
  messages: [],
  login: () => {},
  logout: () => {},
  submitMessage: () => {},
})

const AppContextProvider: FC<{ children: any }> = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])

  const logout = () => {
    destroyUser()
  }

  const loadInitialData = async () => {
    setLoading(true)
    const { data: usersData } = await supabase.from('users').select()
    const { data: messagesData } = await supabase.from('messages').select()

    setMessages(messagesData as Message[])
    setUsers(usersData as User[])
    setLoading(false)
  }

  const setUniqueMessages = (message: Message) => {
    setMessages(prev => {
      const prevMessagesIds = Array.from(new Set(prev.map(m => m.id))).filter(i => !!i)

      if (prevMessagesIds.includes(message.id)) {
        return prev
      }

      return [...prev, message]
    })
  }

  const setUniqueUsers = (user: User) => {
    setUsers(prev => {
      const prevUsersIds = Array.from(new Set(prev.map(u => u.local_id))).filter(i => !!i)

      if (prevUsersIds.includes(user.local_id)) {
        return prev
      }

      return [...prev, user]
    })
  }

  const destroyUser  = async () => {
    if (user?.id) {
      await supabase.from('users').delete().eq('local_id', user.local_id)
      window.localStorage.removeItem(AppConfig.LOCAL_USER_ID_STORAGE_KEY)
      setUser(null)
    }
  }

  const subscribe = () => {
    supabase
      .channel('channel-a')
      .on('postgres_changes', {event: '*', schema: 'public', table: 'messages'}, payload => {
        if (Object.keys(payload.new).length > 0){
          setUniqueMessages(payload.new)
        }
      })
      .subscribe()

    supabase
      .channel('channel-b')
      .on('postgres_changes', {event: '*', schema: 'public', table: 'users'}, payload => {
        if (Object.keys(payload.new).length > 0){
          setUniqueUsers(payload.new)
        } else {
          setUsers(prev => prev.filter(u => u.id !== payload.old.id))
        }
      })
      .subscribe()
  }

  const createMessage = async (message: string) => {
    try {
      if (user) {
        const createMessage = await supabase.from('messages').insert([
          {
            text: message,
            author_local_id: user.local_id,
            author_name: user.name,
          }
        ])

        if (createMessage.error) {
          return
        }

      }
    } catch(error) {}
  }

  const createUser = async (name: string) => {
    const localId = uuidv4()

    try {
      const createUser = await supabase.from("users").insert([
        {
          name,
          avatar: getRandomAvatarUrl(),
          local_id: localId,
        },
      ]);

      if (createUser.error) {
        return
      }

      window.localStorage.setItem(AppConfig.LOCAL_USER_ID_STORAGE_KEY, localId)

      const userResponse = await supabase.from('users').select().eq('local_id', localId)
      const userData = userResponse?.data?.[0]

      if (userData) {
        setUser(userData)
      }
    } catch (error) {}
  }

  const login = async (name: string) => {
    await createUser(name);
    loadInitialData();
    subscribe();
  }

  const submitMessage = (message: string) => {
    createMessage(message)
  }

  return (
    <AppContext.Provider value={{user, users, messages, submitMessage, logout, login, loading}}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext);

export default AppContextProvider
