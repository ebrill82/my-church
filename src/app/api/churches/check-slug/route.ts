import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const checkSlugSchema = z.object({
  slug: z.string().min(1, 'Le slug est requis'),
})

// GET: Check if a slug is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slugParam = searchParams.get('slug') || ''

    const result = checkSlugSchema.safeParse({ slug: slugParam })

    if (!result.success) {
      return NextResponse.json(
        { message: 'Le slug est requis' },
        { status: 400 }
      )
    }

    const { slug } = result.data

    // Validate slug format: lowercase, hyphens, alphanumeric
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    const isValidFormat = slugRegex.test(slug)

    if (!isValidFormat) {
      return NextResponse.json({
        available: false,
        slug,
        message: 'Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets',
      })
    }

    const existingChurch = await db.church.findUnique({
      where: { slug },
      select: { id: true, name: true },
    })

    if (existingChurch) {
      return NextResponse.json({
        available: false,
        slug,
        suggestion: `${slug}-${Math.floor(Math.random() * 9) + 2}`,
        message: `Ce slug est déjà utilisé par "${existingChurch.name}"`,
      })
    }

    return NextResponse.json({
      available: true,
      slug,
      message: 'Ce slug est disponible',
    })
  } catch (error) {
    console.error('Check slug error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
