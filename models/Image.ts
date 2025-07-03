import mongoose, { Schema, model, models } from "mongoose";

export const IMAGE_DIMENSIONS = {
  width: 1080,
  height: 1080,
} as const;

export interface IImage {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  alt?: string;
  format?: "jpg" | "png" | "webp" | "avif";
  transformations?: {
    width: number;
    height: number;
    crop?: boolean;
    fit?: "cover" | "contain" | "fill";
    quality?: number;
  };
}

const ImageSchema = new Schema<IImage>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    alt: { type: String, default: "" },
    format: {
      type: String,
      enum: ["jpg", "png", "webp", "avif"],
      default: "webp",
    },
    transformations: {
      width: { type: Number, default: IMAGE_DIMENSIONS.width },
      height: { type: Number, default: IMAGE_DIMENSIONS.height },
      crop: { type: Boolean, default: false },
      fit: {
        type: String,
        enum: ["cover", "contain", "fill"],
        default: "cover",
      },
      quality: { type: Number, min: 1, max: 100 },
    },
  },
  {
    timestamps: true,
  }
);

const Image = models?.Image || model<IImage>("Image", ImageSchema);

export default Image;