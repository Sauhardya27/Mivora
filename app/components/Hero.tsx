"use client";
import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [themeResolved, setThemeResolved] = useState(false);

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    setMounted(true);
    
    const timer = setTimeout(() => {
      setThemeResolved(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleExplore = () => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleCreate = () => {
    if (status === "authenticated") {
      router.push("/upload");
    } else {
      router.push("/login");
    }
  };

  if (!mounted || !themeResolved) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="relative flex h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 md:px-8 md:py-12 bg-white dark:bg-neutral-900 transition-colors duration-300"
    >
      <BackgroundGrids />
      <CollisionMechanism
        beamOptions={{
          initialX: -400,
          translateX: 600,
          duration: 7,
          repeatDelay: 3,
        }}
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
        parentRef={parentRef as React.RefObject<HTMLDivElement>}
      />
      <CollisionMechanism
        beamOptions={{
          initialX: -200,
          translateX: 800,
          duration: 4,
          repeatDelay: 3,
        }}
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
        parentRef={parentRef as React.RefObject<HTMLDivElement>}
      />
      <CollisionMechanism
        beamOptions={{
          initialX: 200,
          translateX: 1200,
          duration: 5,
          repeatDelay: 3,
        }}
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
        parentRef={parentRef as React.RefObject<HTMLDivElement>}
      />
      <CollisionMechanism
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
        parentRef={parentRef as React.RefObject<HTMLDivElement>}
        beamOptions={{
          initialX: 400,
          translateX: 1400,
          duration: 6,
          repeatDelay: 3,
        }}
      />

      <h1 className="text-balance relative z-50 mx-auto mb-4 max-w-5xl text-center text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 leading-tight">
        <span className="block">
          Create, edit, and enhance{" "}
          <span className="inline-flex gap-1 flex-wrap justify-center">
            <span className="relative inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
              <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent [text-shadow:0_0_rgba(0,0,0,0.1)]">
                images
              </span>
            </span>
            <span className="mx-1 sm:mx-2">&</span>
            <span className="relative inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent [text-shadow:0_0_rgba(0,0,0,0.1)]">
                videos
              </span>
            </span>
          </span>
        </span>

        <span className="block mt-1 sm:mt-2">
          with the power of{" "}
          <span className="relative inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent [text-shadow:0_0_rgba(0,0,0,0.1)]">
              AI
            </span>
          </span>
        </span>
      </h1>

      <p className="relative z-50 mx-auto mt-4 sm:mt-6 max-w-2xl px-4 text-center text-sm sm:text-base leading-6 sm:leading-7 text-gray-700 dark:text-gray-200">
        Transform your images and videos with cutting-edge AI technology.
        Upload, process, and enhance your content with advanced video processing
        capabilities.
      </p>

      <div className="relative z-50 mx-auto my-3 sm:my-4 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-amber-700 dark:text-amber-400"
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium text-center">
            ✨ Login required to unlock the magic of Mivora
          </span>
        </motion.div>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-center gap-3 sm:gap-4 md:gap-8 px-4 sm:px-8 sm:flex-row max-w-md sm:max-w-none -mb-10">
        <button 
          onClick={handleExplore}
          className="group relative z-20 flex h-11 sm:h-12 w-full cursor-pointer items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-px px-4 sm:px-6 py-3 text-center text-sm font-semibold leading-6 text-white no-underline transition duration-200 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 sm:w-60">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 8.64v6.72c0 .48.54.77.94.5l5.24-3.36a.6.6 0 000-1l-5.24-3.36a.6.6 0 00-.94.5z"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span>Explore Videos</span>
        </button>
        <button 
          onClick={handleCreate}
          className="group relative z-20 flex h-11 sm:h-12 w-full sm:w-60 cursor-pointer items-center justify-center gap-2 truncate rounded-lg bg-white border-2 border-gray-300 px-3 sm:px-4 text-sm font-semibold text-gray-800 no-underline shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-purple-400 dark:bg-neutral-800 dark:text-white dark:border-neutral-600 dark:hover:border-purple-400">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="truncate">Create Your Own Video</span>
        </button>
      </div>

      <div ref={containerRef} className="absolute bottom-0 left-0 right-0 h-1 z-10" />
    </div>
  );
}

const BackgroundGrids = () => {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 grid h-full w-full -rotate-45 transform select-none grid-cols-2 gap-10 md:grid-cols-4">
        <div className="relative h-full w-full">
          <GridLineVertical className="left-0" />
          <GridLineVertical className="left-auto right-0" />
        </div>
        <div className="relative h-full w-full">
          <GridLineVertical className="left-0" />
          <GridLineVertical className="left-auto right-0" />
        </div>
        <div className="relative h-full w-full bg-gradient-to-b from-transparent via-neutral-200 to-transparent dark:via-neutral-800">
          <GridLineVertical className="left-0" />
          <GridLineVertical className="left-auto right-0" />
        </div>
        <div className="relative h-full w-full">
          <GridLineVertical className="left-0" />
          <GridLineVertical className="left-auto right-0" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-5 dark:hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/20 via-purple-200/15 to-pink-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-200/15 via-blue-200/10 to-indigo-200/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-100/10 via-transparent to-blue-100/10 rounded-full blur-3xl" />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.08) 0%, transparent 50%), 
                                     radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                                     radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.04) 0%, transparent 70%)`,
          }}
        />
      </div>
    </>
  );
};

const CollisionMechanism = React.forwardRef<
  HTMLDivElement,
  {
    containerRef: React.RefObject<HTMLDivElement>;
    parentRef: React.RefObject<HTMLDivElement>;
    beamOptions?: {
      initialX?: number;
      translateX?: number;
      initialY?: number;
      translateY?: number;
      rotate?: number;
      className?: string;
      duration?: number;
      delay?: number;
      repeatDelay?: number;
    };
  }
>(({ parentRef, containerRef, beamOptions = {} }, ref) => {
  const beamRef = useRef<HTMLDivElement>(null);
  const [collision, setCollision] = useState<{
    detected: boolean;
    coordinates: { x: number; y: number } | null;
  }>({
    detected: false,
    coordinates: null,
  });
  const [beamKey, setBeamKey] = useState(0);
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

  useEffect(() => {
    const checkCollision = () => {
      if (
        beamRef.current &&
        containerRef.current &&
        parentRef.current &&
        !cycleCollisionDetected
      ) {
        const beamRect = beamRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();

        if (beamRect.bottom >= containerRect.top) {
          const relativeX =
            beamRect.left - parentRect.left + beamRect.width / 2;
          const relativeY = beamRect.bottom - parentRect.top;

          setCollision({
            detected: true,
            coordinates: {
              x: relativeX,
              y: relativeY,
            },
          });
          setCycleCollisionDetected(true);
          if (beamRef.current) {
            beamRef.current.style.opacity = "0";
          }
        }
      }
    };

    const animationInterval = setInterval(checkCollision, 50);

    return () => clearInterval(animationInterval);
  }, [cycleCollisionDetected, containerRef]);

  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycleCollisionDetected(false);
        if (beamRef.current) {
          beamRef.current.style.opacity = "1";
        }
      }, 2000);

      setTimeout(() => {
        setBeamKey((prevKey) => prevKey + 1);
      }, 2000);
    }
  }, [collision]);

  return (
    <>
      <motion.div
        key={beamKey}
        ref={beamRef}
        animate="animate"
        initial={{
          y: beamOptions.initialY || "-200px",
          x: beamOptions.initialX || "0px",
          rotate: beamOptions.rotate || -45,
        }}
        variants={{
          animate: {
            y: beamOptions.translateY || "800px",
            x: beamOptions.translateX || "700px",
            rotate: beamOptions.rotate || -45,
          },
        }}
        transition={{
          duration: beamOptions.duration || 8,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          delay: beamOptions.delay || 0,
          repeatDelay: beamOptions.repeatDelay || 0,
        }}
        className={cn(
          "absolute left-96 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-orange-500 via-yellow-500 to-transparent",
          beamOptions.className
        )}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            className=""
            style={{
              left: `${collision.coordinates.x + 20}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
});

CollisionMechanism.displayName = "CollisionMechanism";

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
  const spans = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }));

  return (
    <div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-[4px] w-10 rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-sm"
      ></motion.div>
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-orange-500 to-yellow-500"
        />
      ))}
    </div>
  );
};

const GridLineVertical = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(139, 92, 246, 0.25)",
          "--height": "5px",
          "--width": "1px",
          "--fade-stop": "90%",
          "--offset": offset || "150px",
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className
      )}
    ></div>
  );
};