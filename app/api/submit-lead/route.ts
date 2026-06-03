import { NextRequest, NextResponse } from "next/server"
import { insertLeadFromForm } from "@/lib/leadSync"

export async function POST(req: NextRequest) {
  try {
    let data: Record<string, string> = {}

    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      data = await req.json()
    } else {
      // Handle form data (multipart or urlencoded)
      const formData = await req.formData()
      formData.forEach((value, key) => {
        data[key] = value.toString()
      })
    }

    const result = await insertLeadFromForm(data)

    if (!result) {
      return NextResponse.json({ success: false, error: "Failed to save lead" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (err) {
    console.error("[submit-lead] error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

// Allow cross-origin requests from the client's website
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
