import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
	if (req.nextUrl.pathname == '/api/hello') {
		console.log('middleware:', req.nextUrl)
		if (req.method != 'POST') {
			return new NextResponse('Cannot access this endpoint with ' + req.method, { status: 400 })
		}
		return NextResponse.next()
	}
}
