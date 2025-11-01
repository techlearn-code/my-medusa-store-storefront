'use server'

import { revalidateTag } from 'next/cache'
import { getCacheTag, setAuthToken } from './cookies'

export async function setSession(token: string) {
  await setAuthToken(token as string)
  const customerCacheTag = await getCacheTag('customers')
  revalidateTag(customerCacheTag)
}
