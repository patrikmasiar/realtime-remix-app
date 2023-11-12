import type { FC} from "react";
import {createContext, useContext, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import { supabaseClient as supabase } from "../utils/supabase";
import type {Message, User} from "~/types";
import {getRandomAvatarUrl} from '~/utils/avatar';
import {useLocalUser} from "~/hooks/useLocalUser";

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
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const { localUser, setLocalUser } = useLocalUser()


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
    if (localUser?.local_id) {
      await supabase.from('users').delete().eq('local_id', localUser.local_id)
      setLocalUser(null)
    }
  }

  const subscribe = () => {
    supabase
      .channel('channel-a')
      .on('postgres_changes', {event: '*', schema: 'public', table: 'messages'}, payload => {
        if (Object.keys(payload.new).length > 0){
          // @ts-ignore
          setUniqueMessages(payload.new)
        }
      })
      .subscribe()

    supabase
      .channel('channel-b')
      .on('postgres_changes', {event: '*', schema: 'public', table: 'users'}, payload => {
        if (Object.keys(payload.new).length > 0){
          // @ts-ignore
          setUniqueUsers(payload.new)
        } else {
          // @ts-ignore
          setUsers(prev => prev.filter(u => u.id !== payload.old.id))
        }
      })
      .subscribe()
  }

  const createMessage = async (message: string) => {
    try {
      if (localUser) {
        const createMessage = await supabase.from('messages').insert([
          {
            text: message,
            author_local_id: localUser.local_id,
            author_name: localUser.name,
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

      const userResponse = await supabase.from('users').select().eq('local_id', localId)
      const userData = userResponse?.data?.[0]

      if (userData) {
        setLocalUser(userData)
      }
    } catch (error) {}
  }

  const login = async (name: string) => {
    await createUser(name);
    await loadInitialData();
    subscribe();
  }

  const submitMessage = (message: string) => {
    createMessage(message)
  }

  return (
    <AppContext.Provider value={{user: localUser, users, messages, submitMessage, logout, login, loading}}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext);

export default AppContextProvider
