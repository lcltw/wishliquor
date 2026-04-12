import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'
import DesignClient from './DesignClient'

async function getInitialData() {
  try {
    const fs = await import('fs')
    const path = await import('path')
    const raw = fs.readFileSync(path.join(process.cwd(), '.wishliquor-data.json'), 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default async function DesignPage() {
  const session = await getServerSession(authOptions)
  const initialData = await getInitialData()

  return <DesignClient session={session} initialData={initialData} />
}
