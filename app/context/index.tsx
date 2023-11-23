import type { FC} from "react";
import {createContext, useContext, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import { supabaseClient as supabase } from "../utils/supabase";
import type {Message, User, Cursor} from "~/types";
import {getRandomAvatarUrl} from '~/utils/avatar';
import {useLocalUser} from "~/hooks/useLocalUser";
import AppConfig from "~/config";

const AppContext = createContext<{
  loading: boolean;
  user: User | null;
  users: User[];
  messages: Message[];
  login: (data: {name: string; roomName: string}) => void;
  logout: () => void;
  submitMessage: (message: string) => void;
  cursors: Cursor[];
}>({
  loading: false,
  user: null,
  users: [],
  messages: [],
  cursors: [],
  login: () => {},
  logout: () => {},
  submitMessage: () => {},
})

const AppContextProvider: FC<{ children: any }> = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [cursors, setCursors] = useState<Cursor[]>([])
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
      setCursors(prev => prev.filter(c => c.userId !== localUser?.id))
      await supabase.from('users').delete().eq('local_id', localUser.local_id)
      setLocalUser(null)
    }
  }

  const subscribe = (channel: string) => {
    supabase
      .channel(`${AppConfig.MESSAGES_CHANNEL}-${channel}`)
      .on('postgres_changes', {event: '*', schema: 'public', table: 'messages' }, payload => {
        if (Object.keys(payload.new).length > 0){
          // @ts-ignore
          setUniqueMessages(payload.new)
        }
      })
      .subscribe()

    supabase
      .channel(`${AppConfig.USERS_CHANNEL}-${channel}`)
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

        supabase.channel(AppConfig.CURSORS_CHANNEL)
          .on(
            'broadcast',
            { event: 'cursor' },
            // @ts-ignore
            ({ payload }) => {
              if (payload.userId !== userData?.id) {
                  setCursors(prev => {
                    // @ts-ignore
                    const prevCursorsIds = Array.from(new Set(prev.map(c => c.userId))).filter(i => !!i)

                    // @ts-ignore
                    if (prevCursorsIds.includes(payload.userId)) {
                      // @ts-ignore
                      return prev.map(c => c.userId === payload.userId ? payload : c)
                    }

                    return [...prev, payload]
                  })
              }
            }
          )
          .subscribe()
      }
    } catch (error) {}
  }

  const login = async (data: { name: string; roomName: string }) => {
    await createUser(data.name);
    await loadInitialData();
    subscribe(data.roomName);
  }

  const submitMessage = (message: string) => {
    createMessage(message)
  }

  return (
    <AppContext.Provider value={{user: localUser, users, cursors, messages, submitMessage, logout, login, loading}}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext);

export default AppContextProvider
