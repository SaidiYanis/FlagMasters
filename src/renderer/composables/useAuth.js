import { onBeforeUnmount, ref } from 'vue'
import { loginGoogle, logoutGoogle, subscribeAuth } from '../services/authService'

export function useAuth() {
  const user = ref(null)
  let unsubscribe

  const initAuth = (onChange) => {
    if (unsubscribe) unsubscribe()
    unsubscribe = subscribeAuth((u) => {
      user.value = u || null
      if (onChange) onChange(user.value)
    })
  }

  const login = async () => {
    const res = await loginGoogle()
    user.value = res || null
    return user.value
  }

  const logout = async () => {
    try {
      await logoutGoogle()
    } finally {
      user.value = null
    }
  }

  onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe()
  })

  return { user, initAuth, login, logout }
}
