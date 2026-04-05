import { NextResponse } from 'next/server'
import { dataStore } from './store'

export async function GET() {
  const data = dataStore.getAll()
  return NextResponse.json(data as unknown)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { products, filters, settings } = body

    if (products) {
      dataStore.setProducts(products)
    }
    if (filters) {
      dataStore.setFilters(filters)
    }
    if (settings) {
      dataStore.setSettings(settings)
    }

    return NextResponse.json({ success: true, message: 'Data saved to shared store' })
  } catch (e) {
    console.error('Error saving data:', e)
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
