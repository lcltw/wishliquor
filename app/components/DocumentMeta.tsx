'use client'

import { useEffect } from 'react'
import { useData } from '../context/DataContext'

export default function DocumentMeta() {
  const { settings } = useData()

  useEffect(() => {
    if (settings?.content?.pageTitle) {
      document.title = settings.content.pageTitle
    }
    if (settings?.content?.pageDescription) {
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute('content', settings.content.pageDescription)
      }
    }
  }, [settings?.content?.pageTitle, settings?.content?.pageDescription])

  return null
}
