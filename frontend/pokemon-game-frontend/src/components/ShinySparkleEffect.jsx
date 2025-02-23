import React, { useEffect, useRef } from "react";

const ShinySparkleEffect = ({ pokemonRef }) => {
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let particles = [];
        let isAnimating = true;

        if (!pokemonRef?.current) return;

        const pokemonRect = pokemonRef.current.getBoundingClientRect();
        const containerRect = pokemonRef.current.offsetParent.getBoundingClientRect();

        const startX = pokemonRect.left - containerRect.left + pokemonRect.width / 2;
        const startY = pokemonRect.top - containerRect.top + pokemonRect.height / 2;

        canvas.width = containerRect.width;
        canvas.height = containerRect.height;

        const sparkleImage = new Image();
        sparkleImage.src =
            "https://github.com/ZeChrales/PogoAssets/blob/master/static_assets/png/sparkle.png?raw=true";

        sparkleImage.onload = () => {
            initializeParticles();
            animate();
        };

        const initializeParticles = () => {
            particles = [];
            for (let i = 0; i < 10; i++) {
                particles.push(createSparkle());
            }
        };

        const createSparkle = () => ({
            x: startX,
            y: startY,
            scale: Math.random() * 0.5 + 0.5,
            radius: Math.random() * 20 + 40,
            angle: Math.random() * 360,
            opacity: 1,
            speed: Math.random() * 2 + 1,
        });

        const animate = () => {
            if (!isAnimating) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((sparkle, index) => {
                ctx.globalAlpha = sparkle.opacity;
                ctx.drawImage(
                    sparkleImage,
                    sparkle.x + Math.cos(sparkle.angle * Math.PI / 180) * sparkle.radius - 16,
                    sparkle.y + Math.sin(sparkle.angle * Math.PI / 180) * sparkle.radius - 16,
                    32 * sparkle.scale,
                    32 * sparkle.scale
                );

                sparkle.radius += sparkle.speed;
                sparkle.opacity -= 0.02;
                sparkle.angle += 3;

                if (sparkle.opacity <= 0) {
                    particles.splice(index, 1);
                }
            });

            if (particles.length > 0) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        timeoutRef.current = setTimeout(() => {
            isAnimating = false;
            cancelAnimationFrame(animationFrameRef.current);
        }, 3000);

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            clearTimeout(timeoutRef.current);
        };
    }, [pokemonRef]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 3 }}
        />
    );
};

export default ShinySparkleEffect;
