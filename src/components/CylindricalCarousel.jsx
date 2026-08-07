import React from "react";

// Tiny local replacement for the shadcn "cn" helper — just joins
// truthy class names together, no external alias/config needed.
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * CylinderCarousel
 * Renders a set of images rotating in a 3D cylinder using pure CSS transforms.
 *
 * Props:
 *  - images: [{ src, alt }]
 *  - containerClassName, cardClassName, className
 *  - animationDuration: seconds for one full rotation (default 32)
 *  - cardWidth: px width of each card (default 250)
 */
export const CylinderCarousel = React.forwardRef(
  (
    {
      images,
      className,
      containerClassName,
      cardClassName,
      animationDuration = 32,
      cardWidth = 250,
      // Bigger perspective = flatter, less fisheye/circular feel.
      perspective = "70em",
      // Pushes every card further from the camera along its radius,
      // so the front card never swings in close to fill the screen.
      // 1 = original tight circle, try 1.4–1.8 for a calmer, flatter loop.
      radiusScale = 1.6,
      ...props
    },
    ref
  ) => {
    const N = images.length;

    // CSS custom properties driving the cylinder geometry
    const customStyle = {
      "--n": N,
      "--w": `${cardWidth}px`,
      "--ba": `calc(1turn / var(--n))`,
      "--anim-dur": `${animationDuration}s`,
      "--radius-scale": radiusScale,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full h-full min-h-[500px] grid place-items-center overflow-hidden",
          className
        )}
        style={{
          perspective,
          maskImage:
            "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
        }}
        {...props}
      >
        <div
          className={cn(
            "grid place-items-center [transform-style:preserve-3d] motion-reduce:!animate-[ry_128s_linear_infinite]",
            containerClassName
          )}
          style={{
            ...customStyle,
            animation: "ry var(--anim-dur) linear infinite",
          }}
        >
          <style>
            {`
              @keyframes ry {
                to { transform: rotateY(1turn); }
              }
            `}
          </style>

          {images.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt || `Carousel image ${i}`}
              className={cn(
                "[grid-area:1/1] object-cover rounded-2xl [backface-visibility:hidden]",
                cardClassName
              )}
              style={{
                width: "var(--w)",
                aspectRatio: "16/10",
                "--i": i,
                transform:
                  "rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * var(--radius-scale) * (0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))))",
              }}
            />
          ))}
        </div>
      </div>
    );
  }
);

CylinderCarousel.displayName = "CylinderCarousel";

export default CylinderCarousel;
