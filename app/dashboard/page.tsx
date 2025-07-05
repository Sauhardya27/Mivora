"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import ImageUpload from "../components/ImageUpload";
import VideoUpload from "../components/VideoUpload";
import { IImage } from "@/models/Image";
import { IVideo } from "@/models/Video";

interface UploadImagePayload extends Omit<IImage, "imageUrl"> {
  imageUrl: string | null;
  file: File | null;
}

interface UploadVideoPayload extends Omit<IVideo, "videoUrl" | "thumbnailUrl"> {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  file: File | null;
  uploadResponse?: any;
  savedVideo?: any;
}

interface ImageData {
  id: string;
  title: string;
  thumbnail: string;
  date: string;
  aiFeatures: string[];
}

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  date: string;
  aiFeatures: string[];
  duration: number;
}

const Dashboard = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("images");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [particles, setParticles] = useState<{ left: number; top: number }[]>(
    []
  );
  const [mounted, setMounted] = useState(false);
  const [themeResolved, setThemeResolved] = useState(false);
  const [imagesData, setImagesData] = useState<ImageData[]>([]);
  const [videosData, setVideosData] = useState<VideoData[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const timer = setTimeout(() => {
      setThemeResolved(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const generatedParticles = Array.from({ length: 30 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setParticles(generatedParticles);
  }, []);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchImages = async () => {
      if (!session?.user?.email) return;

      setLoadingImages(true);
      setError(null);

      try {
        const response = await fetch("/api/image", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }

        const fetchedImages: IImage[] = await response.json();

        if (!Array.isArray(fetchedImages) || fetchedImages.length === 0) {
          console.log("No images found for user:", session.user.email);
          setImagesData([]);
          return;
        }

        const transformedImages: ImageData[] = fetchedImages.map((image) => ({
          id: image._id?.toString() || "",
          title: image.title,
          thumbnail: image.imageUrl,
          date: (image as any).createdAt
            ? new Date((image as any).createdAt).toLocaleDateString()
            : "Unknown",
          aiFeatures: ["AI Enhanced", "Auto Format"],
        }));

        setImagesData(transformedImages);
      } catch (err) {
        console.error("Network or server error while fetching images:", err);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, [session?.user?.email]);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!session?.user?.email) return;

      setLoadingVideos(true);
      setError(null);

      try {
        const response = await fetch("/api/video", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }

        const fetchedVideos = (await response.json()) as IVideo[];

        if (!Array.isArray(fetchedVideos) || fetchedVideos.length === 0) {
          console.log("No videos found for user:", session.user.email);
          setVideosData([]);
          return;
        }

        const transformedVideos: VideoData[] = fetchedVideos.map((video) => ({
          id: video._id?.toString() || "",
          title: video.title,
          thumbnail: video.thumbnailUrl,
          date: (video as any).createdAt
            ? new Date((video as any).createdAt).toLocaleDateString()
            : "Unknown",
          aiFeatures: ["AI Enhanced", "Auto Format", "Smart Compression"],
          duration: video.duration,
        }));

        setVideosData(transformedVideos);
      } catch (err) {
        console.error("Network or server error while fetching videos:", err);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [session?.user?.email]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleUpload = () => {
    if (activeTab === "images") {
      setShowImageUpload(true);
    } else {
      setShowVideoUpload(true);
    }
  };

  const handleImageUploadClose = () => {
    setShowImageUpload(false);
  };

  const handleVideoUploadClose = () => {
    setShowVideoUpload(false);
  };

  const handleImageUploadSubmit = async (data: UploadImagePayload) => {
    console.log("Image uploaded:", data);
    setShowImageUpload(false);

    if (session?.user?.email) {
      try {
        const response = await fetch("/api/image", {
          credentials: "include",
        });

        if (response.ok) {
          const fetchedImages: IImage[] = await response.json();
          const transformedImages: ImageData[] = fetchedImages.map((image) => ({
            id: image._id?.toString() || "",
            title: image.title,
            thumbnail: image.imageUrl,
            date: image.createdAt
              ? new Date(image.createdAt).toLocaleDateString()
              : "Unknown",
            aiFeatures: ["AI Enhanced", "Auto Format"],
          }));
          setImagesData(transformedImages);
        }
      } catch (err) {
        console.error("Error refreshing images:", err);
      }
    }
  };

  const handleVideoUploadSubmit = async (data: UploadVideoPayload) => {
    console.log("Video uploaded:", data);
    setShowVideoUpload(false);

    if (session?.user?.email) {
      try {
        const response = await fetch("/api/video", {
          credentials: "include",
        });

        if (response.ok) {
          const fetchedVideos = (await response.json()) as IVideo[];
          const transformedVideos: VideoData[] = fetchedVideos.map((video) => ({
            id: video._id?.toString() || "",
            title: video.title,
            thumbnail: video.thumbnailUrl,
            date: video.createdAt
              ? new Date(video.createdAt).toLocaleDateString()
              : "Unknown",
            aiFeatures: ["AI Enhanced", "Auto Format", "Smart Compression"],
            duration: video.duration,
          }));
          setVideosData(transformedVideos);
        }
      } catch (err) {
        console.error("Error refreshing videos:", err);
      }
    }
  };

  const isLoading = activeTab === "images" ? loadingImages : loadingVideos;
  const currentData: (ImageData | VideoData)[] = activeTab === "images" ? imagesData : videosData;

  if (!mounted || !themeResolved) {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to access your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20 dark:opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.1), transparent 40%)`,
          }}
        />

        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(180deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              animation: "pulse 4s ease-in-out infinite alternate",
            }}
          />
        </div>

        <div className="absolute inset-0 dark:hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-200/20 via-purple-200/15 to-pink-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-200/15 via-blue-200/10 to-indigo-200/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-100/10 via-transparent to-blue-100/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="absolute inset-0 hidden dark:block">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-indigo-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 dark:bg-blue-400 rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center mb-8 sm:mb-12"
        >
          <div className="relative mt-14">
            <div className="absolute inset-0 bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/20 shadow-lg dark:shadow-2xl" />

            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-pink-500/30 opacity-20 blur-md dark:blur-xl animate-pulse" />

            <div className="relative flex p-1 sm:p-2">
              {[
                {
                  id: "images",
                  label: "Images",
                  icon: "🖼️",
                  count: imagesData.length,
                },
                {
                  id: "videos",
                  label: "Videos",
                  icon: "🎬",
                  count: videosData.length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-500 flex items-center space-x-2 sm:space-x-3 group text-sm sm:text-base ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {activeTab === tab.id && (
                    <>
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-lg sm:rounded-xl shadow-lg"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-lg sm:rounded-xl blur-lg opacity-50"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    </>
                  )}

                  <span className="relative z-10 text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-300">
                    {tab.icon}
                  </span>
                  <div className="relative z-10 flex flex-col items-start">
                    <span className="text-sm sm:text-base md:text-lg font-bold">
                      {tab.label}
                    </span>
                    <span className="text-xs opacity-75 hidden sm:block">
                      {tab.count} items
                    </span>
                  </div>

                  {activeTab !== tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <button
            onClick={handleUpload}
            className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold text-sm sm:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center space-x-2 sm:space-x-3">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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
              <span>Upload {activeTab === "images" ? "Image" : "Video"}</span>
            </div>
          </button>
        </motion.div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading {activeTab}...
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "images" ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === "images" ? 50 : -50 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {!isLoading &&
              currentData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  onMouseEnter={() =>
                    setHoveredCard(
                      typeof item.id === "string" ? parseInt(item.id) : item.id
                    )
                  }
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative h-full"
                >
                  <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg dark:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 border border-gray-200 dark:border-white/10 hover:border-purple-500/50 h-full flex flex-col">
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative h-40 sm:h-48 overflow-hidden flex-shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {activeTab === "videos" && "duration" in item && typeof item.duration === "number" && (
                        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/70 text-white px-2 py-1 rounded text-xs sm:text-sm backdrop-blur-sm">
                          {formatDuration(item.duration)}
                        </div>
                      )}

                      {activeTab === "videos" && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                            <svg
                              className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {item.date}
                      </p>

                      <div className="mb-4 flex-grow">
                        <div className="flex flex-wrap gap-2 h-16 overflow-y-auto">
                          {item.aiFeatures.map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-blue-500/20 text-purple-700 dark:text-blue-300 rounded-full text-xs font-medium border border-purple-200 dark:border-blue-500/30 flex-shrink-0 h-fit"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-auto">
                        <button className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base">
                          {activeTab === "images" ? "Edit" : "Edit Video"}
                        </button>
                        <button className="p-2 sm:p-3 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors backdrop-blur-sm border border-gray-200 dark:border-white/10">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {hoveredCard ===
                    (typeof item.id === "string"
                      ? parseInt(item.id)
                      : item.id) && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-purple-400 dark:bg-blue-400 rounded-full"
                          initial={{
                            x: Math.random() * 300,
                            y: Math.random() * 300,
                            opacity: 0,
                          }}
                          animate={{
                            y: -30,
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
          </motion.div>
        </AnimatePresence>

        {!isLoading && currentData.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 opacity-50">
              {activeTab === "images" ? "🖼️" : "🎬"}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              No {activeTab} yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg">
              Start by uploading your first{" "}
              {activeTab === "images" ? "image" : "video"}
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showImageUpload && (
          <ImageUpload
            onClose={handleImageUploadClose}
            onUpload={handleImageUploadSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideoUpload && (
          <VideoUpload
            onClose={handleVideoUploadClose}
            onUpload={handleVideoUploadSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;