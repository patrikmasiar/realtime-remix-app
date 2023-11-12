import type {User} from "~/types";
import AppConfig from "~/config";

export const useLocalUser = () => {
  const getUser = () => {
    const storedValue = global?.window?.localStorage.getItem(AppConfig.LOCAL_USER_STORAGE_KEY)

    if (storedValue) {
      return JSON.parse(storedValue) as User
    }

    return null
  }

  const setUser = (user: User | null) => {
    if (!user) return global?.window?.localStorage.removeItem(AppConfig.LOCAL_USER_STORAGE_KEY)

    return global?.window?.localStorage.setItem(AppConfig.LOCAL_USER_STORAGE_KEY, JSON.stringify(user))
  }

  return {
    localUser: getUser(),
    setLocalUser: setUser,
  }
}