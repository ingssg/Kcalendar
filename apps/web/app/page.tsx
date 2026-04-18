'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStorage } from '@/lib/storage'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const storage = getStorage()
    if (storage.profile) {
      router.replace('/today')
    } else {
      router.replace('/onboarding')
    }
  }, [router])

  return null
}
