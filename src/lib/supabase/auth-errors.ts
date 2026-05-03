const isSupabaseRefreshTokenError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false
  }

  return /refresh token/i.test(error.message)
}

const isSupabaseMissingSessionError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false
  }

  return /auth session missing/i.test(error.message)
}

const isRecoverableSupabaseAuthError = (error: unknown) => {
  return isSupabaseRefreshTokenError(error) || isSupabaseMissingSessionError(error)
}

export { isRecoverableSupabaseAuthError, isSupabaseMissingSessionError, isSupabaseRefreshTokenError }
