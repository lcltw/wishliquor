import { NextResponse } from 'next/server'
import { dataStore } from '../shared-data/store'

export async function GET() {
  return NextResponse.json(dataStore.getAll().settings)
}

export async function POST(request: Request) {
  try {
    const settings = await request.json()
    dataStore.setSettings(settings)
    return NextResponse.json({ success: true, message: 'Settings saved (in-memory)' })
  } catch (e) {
    console.error('Error saving settings:', e)
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
