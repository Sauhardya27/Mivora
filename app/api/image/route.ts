import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Image, { IImage } from "@/models/Image";
import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "User is unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const images = await Image.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(images || [], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "User is unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body: IImage = await request.json();

    if (!body.title || !body.description || !body.imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const imageData = {
      ...body,
      userEmail: session.user.email,
      alt: body.alt ?? "",
      format: body.format ?? "webp",
      transformations: {
        width: 1080,
        height: 1080,
        crop: false,
        fit: "cover",
        quality: body.transformations?.quality ?? 80,
        ...body.transformations,
      },
    };

    const newImage = await Image.create(imageData);
    console.log("New image created:", newImage);

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "User is unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get image ID from query parameters
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the image
    const deletedImage = await Image.findOneAndDelete({
      _id: imageId,
      userEmail: session.user.email // Ensure user can only delete their own images
    });

    if (!deletedImage) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json(deletedImage, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}