"use client";
import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";
import { IImage } from "@/models/Image";

interface UploadPayload extends Omit<IImage, "imageUrl"> {
  imageUrl: string | null;
  file: File | null;
  uploadResponse?: any; 
  savedImage?: any; 
}

interface ImageUploadProps {
  onClose: () => void;
  onUpload: (data: UploadPayload) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<IImage>({
    title: "",
    description: "",
    userEmail: "",
    alt: "",
    format: "webp",
    imageUrl: "",
    transformations: {
      width: 1080,
      height: 1080,
      crop: false,
      fit: "cover",
      quality: 80,
    },
  });

  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const validateFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Invalid file type. Please upload an image file.");
      return false;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100 MB.");
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFormData((prev) => ({
      ...prev,
      title: file.name.replace(/\.[^/.]+$/, ""),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";

    const inputValue =
      isCheckbox && "checked" in e.target
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? Number(value)
        : value;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: inputValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: inputValue,
      }));
    }
  };

  const handleImageKitUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const authRes = await fetch("/api/auth/imagekit-auth");
      const auth = await authRes.json();
      console.log("ImageKit Auth:", auth);

      const { token, signature, expire } = auth.authenticationParameters;

      const res = await upload({
        file: selectedFile,
        fileName: selectedFile.name,
        folder: "images",
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
        expire: expire,
        token: token,
        signature: signature,
        onProgress: (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        },
      });

      const dbPayload = {
        title: formData.title,
        description: formData.description,
        userEmail: formData.userEmail,
        imageUrl: res.url,
        alt: formData.alt,
        format: formData.format,
        transformations: formData.transformations,
        imagekitFileId: res.fileId, 
        imagekitFilePath: res.filePath,
      };

      const dbResponse = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dbPayload),
      });

      console.log("Database Response:", dbResponse);

      if (!dbResponse.ok) {
        throw new Error("Failed to save image to database");
      }

      const savedImage = await dbResponse.json();

      setTimeout(() => {
        setIsUploading(false);
        onUpload({
          ...formData,
          file: selectedFile,
          imageUrl: res.url!, 
          uploadResponse: res, 
          savedImage, 
        });
        onClose();
      }, 500);

    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
      
      if (error instanceof ImageKitAbortError) {
        setError("Upload was cancelled.");
      } else if (error instanceof ImageKitInvalidRequestError) {
        setError("Invalid request. Please check your file and try again.");
      } else if (error instanceof ImageKitServerError) {
        setError("Server error. Please try again later.");
      } else if (error instanceof ImageKitUploadNetworkError) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(error instanceof Error ? error.message : "Upload failed. Please try again.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFile && !isUploading) {
      handleImageKitUpload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-colors duration-300"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-white dark:bg-neutral-900 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl transition-colors duration-300 scrollbar-thin scrollbar-track-gray-100 dark:scrollbar-track-neutral-800 scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-neutral-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Upload Image
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors duration-200"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-white transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl transition-colors duration-300">
            <p className="text-red-600 dark:text-red-400 text-sm transition-colors duration-300">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                Select Image
              </label>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-neutral-800"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {!previewUrl ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-white text-lg font-medium transition-colors duration-300">
                        Drop your image here
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
                        or click to browse
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Supports: JPG, PNG, WebP, AVIF (Max 100MB)
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setError(null);
                      }}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors duration-200"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter image title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Describe your image"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Alt Text
                </label>
                <input
                  type="text"
                  name="alt"
                  value={formData.alt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Alternative text for accessibility"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Format
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="webp" className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white">WebP</option>
                  <option value="jpg" className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white">JPG</option>
                  <option value="png" className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white">PNG</option>
                  <option value="avif" className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white">AVIF</option>
                </select>
              </div>

              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-white/10 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Transformations
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Width
                    </label>
                    <input
                      type="number"
                      name="transformations.width"
                      value={formData.transformations?.width ?? 1080}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Height
                    </label>
                    <input
                      type="number"
                      name="transformations.height"
                      value={formData.transformations?.height ?? 1080}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Fit
                    </label>
                    <select
                      name="transformations.fit"
                      value={formData.transformations?.fit ?? "cover"}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="cover" className="bg-white dark:bg-neutral-700 text-gray-900 dark:text-white">Cover</option>
                      <option value="contain" className="bg-white dark:bg-neutral-700 text-gray-900 dark:text-white">Contain</option>
                      <option value="fill" className="bg-white dark:bg-neutral-700 text-gray-900 dark:text-white">Fill</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Quality ({formData.transformations?.quality ?? 80}%)
                    </label>
                    <input
                      type="range"
                      name="transformations.quality"
                      value={formData.transformations?.quality ?? 80}
                      onChange={handleInputChange}
                      className="w-full h-2 bg-gray-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer slider transition-colors duration-300"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    <input
                      type="checkbox"
                      name="transformations.crop"
                      checked={formData.transformations?.crop ?? false}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-white/10 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-300"
                    />
                    <span>Enable cropping</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-white/10 transition-colors duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">
                    {uploadProgress < 100 ? "Uploading to ImageKit..." : "Saving to database..."}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-neutral-600 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors duration-200 font-medium"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </form>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6);
            cursor: pointer;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          }

          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6);
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default ImageUpload;