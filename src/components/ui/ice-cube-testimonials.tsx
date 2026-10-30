"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export interface TestimonialItem {
  quote: string;
  name: string;
  title: string;
  badge?: string;
  avatar?: string;
}

export interface IceCubeTestimonialsProps {
  items: TestimonialItem[];
  className?: string;
}

// Function to render a High-Density Frosted Glacier Ice Face with Smooth Rounded Edges
function createTestimonialTexture(item: TestimonialItem, avatarImg?: HTMLImageElement | null): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  // 1. High Density Solid Deep Glacier Ice Blue Base (Completely Opaque & Heavy)
  // Deep frosty blue-slate tone matching the screenshot exactly
  ctx.fillStyle = "#121b2d";
  ctx.fillRect(0, 0, 1024, 1024);

  // Volumetric deep frosted gradient
  const bgGrad = ctx.createRadialGradient(512, 450, 80, 512, 512, 720);
  bgGrad.addColorStop(0, "rgba(35, 54, 86, 1)");      // Core luminous frosted body
  bgGrad.addColorStop(0.55, "rgba(20, 32, 54, 1)");   // Heavy dense cold ice
  bgGrad.addColorStop(1, "rgba(11, 19, 34, 1)");      // Dark dense perimeter
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Heavy frosted mist sheen (micro ice crystals scattering light)
  const sheenGrad = ctx.createLinearGradient(0, 0, 1024, 650);
  sheenGrad.addColorStop(0, "rgba(186, 230, 253, 0.16)");
  sheenGrad.addColorStop(0.3, "rgba(103, 232, 249, 0.08)");
  sheenGrad.addColorStop(0.7, "transparent");
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft internal ice rim glow (not harsh border, soft ambient light)
  ctx.save();
  ctx.strokeStyle = "rgba(186, 230, 253, 0.22)";
  ctx.lineWidth = 12;
  ctx.strokeRect(40, 40, 944, 944);

  // Top highlight rim
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, 928, 928);
  ctx.restore();

  // Quote Mark Accent Icon
  ctx.fillStyle = "rgba(103, 232, 249, 0.55)";
  ctx.font = "bold 130px Georgia, serif";
  ctx.fillText("“", 80, 190);

  // Badge Pill
  if (item.badge) {
    ctx.save();
    ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
    ctx.strokeStyle = "rgba(186, 230, 253, 0.38)";
    ctx.lineWidth = 3;
    const badgeText = item.badge.toUpperCase();
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = textWidth + 48;
    const badgeH = 50;
    const bx = 1024 - badgeW - 80;
    const by = 110;

    ctx.beginPath();
    ctx.roundRect(bx, by, badgeW, badgeH, 25);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#bae6fd";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, bx + badgeW / 2, by + badgeH / 2 + 2);
    ctx.restore();
  }

  // Quote Text Wrapping (Clean crisp white typography with deep shadow)
  ctx.save();
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "italic 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;

  const quote = `"${item.quote}"`;
  const maxWidth = 860;
  const lineHeight = 66;
  const startX = 80;
  let startY = 280;

  const words = quote.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, startX, startY);
      line = words[n] + " ";
      startY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, startX, startY);
  ctx.restore();

  // Bottom Rating Stars (Ice Cyan/Neon Glowing Stars like Ludo die accents)
  const starY = 740;
  const starSize = 36;
  const starGap = 48;
  for (let i = 0; i < 5; i++) {
    const sx = 80 + i * starGap;
    ctx.save();
    ctx.fillStyle = "#67e8f9";
    ctx.shadowColor = "rgba(103, 232, 249, 0.9)";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    for (let s = 0; s < 5; s++) {
      ctx.lineTo(
        sx + starSize * Math.cos(((18 + s * 72) * Math.PI) / 180),
        starY - starSize * Math.sin(((18 + s * 72) * Math.PI) / 180)
      );
      ctx.lineTo(
        sx + (starSize / 2) * Math.cos(((54 + s * 72) * Math.PI) / 180),
        starY - (starSize / 2) * Math.sin(((54 + s * 72) * Math.PI) / 180)
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Avatar + Name Section
  const avatarSize = 120;
  const avatarX = 80;
  const avatarY = 820;

  if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Glowing border for avatar
    ctx.save();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Name & Title
  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 10;
  const textLeft = avatarImg ? avatarX + avatarSize + 36 : 80;
  ctx.fillText(item.name, textLeft, avatarY + 52);

  ctx.fillStyle = "#7dd3fc";
  ctx.font = "normal 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(item.title, textLeft, avatarY + 104);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function IceCubeTestimonials({ items = [], className = "" }: IceCubeTestimonialsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFace, setActiveFace] = useState(0);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef({ x: -0.22, y: 0.45 });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const faceAngles = [
    { y: 0.45, x: -0.22 },                  // Front
    { y: -Math.PI / 2 + 0.45, x: -0.22 },   // Right
    { y: -Math.PI + 0.45, x: -0.22 },        // Back
    { y: (-3 * Math.PI) / 2 + 0.45, x: -0.22 } // Left
  ];

  const rotateToFace = useCallback((faceIndex: number) => {
    const totalFaces = 4;
    const clampedFace = ((faceIndex % totalFaces) + totalFaces) % totalFaces;
    setActiveFace(clampedFace);
    targetRotationRef.current = {
      y: faceAngles[clampedFace].y,
      x: faceAngles[clampedFace].x
    };
  }, []);

  // Listen to external scroll trigger
  useEffect(() => {
    const handler = (e: any) => {
      if (typeof e.detail?.index === "number") {
        rotateToFace(e.detail.index % 4);
      }
    };
    window.addEventListener("devcore:select-testimonial", handler);
    return () => window.removeEventListener("devcore:select-testimonial", handler);
  }, [rotateToFace]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 540;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Realistic Studio Lights for Dense Heavy Frosted Ice
    const ambientLight = new THREE.AmbientLight(0xdff4ff, 2.0);
    scene.add(ambientLight);

    const topKeyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    topKeyLight.position.set(6, 9, 7);
    scene.add(topKeyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.6);
    rimLight.position.set(-7, -4, -4);
    scene.add(rimLight);

    // Bottom Violet/Cyan Floor Glow Light (just like the reference image!)
    const floorGlowLight = new THREE.PointLight(0x38bdf8, 5.5, 12);
    floorGlowLight.position.set(0, -3.2, 0);
    scene.add(floorGlowLight);

    const floorGlowPurple = new THREE.PointLight(0x818cf8, 4.0, 10);
    floorGlowPurple.position.set(0, -2.6, 0.8);
    scene.add(floorGlowPurple);

    // 3. Cube Group
    const cubeGroup = new THREE.Group();
    cubeGroupRef.current = cubeGroup;
    cubeGroup.position.set(0, 0.15, 0);
    cubeGroup.rotation.x = targetRotationRef.current.x;
    cubeGroup.rotation.y = targetRotationRef.current.y;
    scene.add(cubeGroup);

    // Bottom Radiant Disc Glow (Underneath the die base like pic)
    const discGeo = new THREE.CircleGeometry(2.3, 48);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.x = -Math.PI / 2;
    discMesh.position.y = -2.15;
    scene.add(discMesh);

    const activeItems = items.slice(0, 4);
    while (activeItems.length < 4) {
      activeItems.push(items[0] || {
        quote: "DevCore transforms high complexity systems into resilient high-velocity market advantages.",
        name: "DevCore Partner",
        title: "Enterprise Client",
        badge: "VERIFIED"
      });
    }

    // Top & Bottom Ice Caps (Dense Frosted with subtle snowflake emblem)
    const capCanvas = document.createElement("canvas");
    capCanvas.width = 512;
    capCanvas.height = 512;
    const capCtx = capCanvas.getContext("2d")!;
    capCtx.fillStyle = "#16233b";
    capCtx.fillRect(0, 0, 512, 512);

    // Radial center frost highlight
    const capGrad = capCtx.createRadialGradient(256, 256, 20, 256, 256, 280);
    capGrad.addColorStop(0, "rgba(56, 189, 248, 0.28)");
    capGrad.addColorStop(1, "rgba(14, 22, 38, 1)");
    capCtx.fillStyle = capGrad;
    capCtx.fillRect(0, 0, 512, 512);

    capCtx.fillStyle = "rgba(103, 232, 249, 0.65)";
    capCtx.font = "bold 130px Georgia, serif";
    capCtx.textAlign = "center";
    capCtx.fillText("“", 256, 310);
    const capTexture = new THREE.CanvasTexture(capCanvas);

    const materials: THREE.MeshPhysicalMaterial[] = [];

    const loadFaceMaterials = async () => {
      const loadedAvatars: (HTMLImageElement | null)[] = await Promise.all(
        activeItems.map((item) => {
          return new Promise<HTMLImageElement | null>((resolve) => {
            if (!item.avatar) return resolve(null);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = item.avatar;
          });
        })
      );

      const tRight = createTestimonialTexture(activeItems[1], loadedAvatars[1]); // +X
      const tLeft = createTestimonialTexture(activeItems[3], loadedAvatars[3]);  // -X
      const tFront = createTestimonialTexture(activeItems[0], loadedAvatars[0]); // +Z
      const tBack = createTestimonialTexture(activeItems[2], loadedAvatars[2]);  // -Z

      // High-Density Heavy Frosted Ice Material (Opaque heavy body + frosted specular sheen)
      const createFaceMat = (tex: THREE.Texture) => {
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          roughness: 0.22,        // Frosted satin blur
          metalness: 0.04,
          transmission: 0.0,      // Heavy density (nothing visible through it)
          reflectivity: 0.85,
          clearcoat: 1.0,         // Smooth ice top coat reflection
          clearcoatRoughness: 0.15,
          ior: 1.45
        });
      };

      const topBottomMat = new THREE.MeshPhysicalMaterial({
        map: capTexture,
        roughness: 0.24,
        metalness: 0.04,
        clearcoat: 0.95,
        clearcoatRoughness: 0.18
      });

      materials[0] = createFaceMat(tRight);
      materials[1] = createFaceMat(tLeft);
      materials[2] = topBottomMat;
      materials[3] = topBottomMat;
      materials[4] = createFaceMat(tFront);
      materials[5] = createFaceMat(tBack);

      // Smooth Rounded Corners Box Geometry (Ludo Dane jaise rounded chamfers)
      // width: 3.1, height: 3.1, depth: 3.1, radius: 0.32, smoothness: 5
      const roundedBoxGeo = new RoundedBoxGeometry(3.1, 3.1, 3.1, 5, 0.32);
      const cubeMesh = new THREE.Mesh(roundedBoxGeo, materials);
      cubeGroup.add(cubeMesh);
    };

    loadFaceMaterials();

    // 5. Mouse & Touch Dragging
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !cubeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.007;
      targetRotationRef.current.x += deltaY * 0.007;
      targetRotationRef.current.x = Math.max(-0.6, Math.min(0.2, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;
      targetRotationRef.current.x = Math.max(-0.6, Math.min(0.2, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);

    // 6. Smooth Physics/Floating Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (cubeGroupRef.current) {
        // Heavy density floating ice die
        cubeGroupRef.current.position.y = 0.15 + Math.sin(elapsed * 1.5) * 0.06;

        cubeGroupRef.current.rotation.y += (targetRotationRef.current.y - cubeGroupRef.current.rotation.y) * 0.085;
        cubeGroupRef.current.rotation.x += (targetRotationRef.current.x - cubeGroupRef.current.rotation.x) * 0.085;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 640;
      const newH = container.clientHeight || 540;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [items]);

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto flex flex-col items-center select-none ${className}`}
      style={{ pointerEvents: "auto" }}
    >
      {/* ── Section Header ── */}
      <div style={{ textAlign: "center", marginBottom: 12, position: "relative", zIndex: 30 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 15px",
            borderRadius: 999,
            background: "rgba(34, 211, 238, 0.12)",
            border: "1px solid rgba(186, 230, 253, 0.45)",
            color: "#bae6fd",
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 8,
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 20px rgba(186,230,253,0.3)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#67e8f9",
              boxShadow: "0 0 10px #67e8f9",
              display: "inline-block",
            }}
          />
          Ice Cube Testimonials
        </div>
        <h3
          style={{
            fontSize: "clamp(1.2rem, 3.2vw, 1.85rem)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            margin: 0,
            textShadow: "0 2px 14px rgba(0,0,0,0.85)",
          }}
        >
          Drag or Scroll to Roll the Ice Die
        </h3>
      </div>

      {/* ── Three.js 3D Viewport ── */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: 680,
          height: 480,
          cursor: "grab",
          position: "relative",
          zIndex: 25,
          touchAction: "none",
        }}
        title="Click & Drag to rotate the Heavy Frosted Ice Cube"
      />

      {/* ── Interactive Navigation Dots (Faces) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 6,
          position: "relative",
          zIndex: 30,
        }}
      >
        {["Face 1", "Face 2", "Face 3", "Face 4"].map((label, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={label}
            onClick={() => rotateToFace(idx)}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.4)",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              width: activeFace === idx ? 34 : 10,
              height: 10,
              background:
                activeFace === idx
                  ? "linear-gradient(90deg, #67e8f9, #38bdf8)"
                  : "rgba(255,255,255,0.25)",
              boxShadow: activeFace === idx ? "0 0 14px #67e8f9" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default IceCubeTestimonials;
