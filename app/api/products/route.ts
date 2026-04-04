import { NextResponse } from 'next/server'
import { dataStore } from '../shared-data/store'

export async function GET() {
  return NextResponse.json(dataStore.getProducts())
}

export async function POST(request: Request) {
  try {
    const products = await request.json()
    dataStore.setProducts(products)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
