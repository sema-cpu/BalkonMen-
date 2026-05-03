const isSupabaseRefreshTokenError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false
  }

  return /refresh token/i.test(error.message)
}

export { isSupabaseRefreshTokenError }
