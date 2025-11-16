"use client";

import { useEffect, useState } from "react";

interface ScrollHeaderProps {
  children: React.ReactNode;
  threshold?: number; // Scroll threshold in pixels
}

export default function ScrollHeader({ children, threshold = 10 }: ScrollHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Ha az oldal tetején vagyunk, mindig mutassuk
          if (currentScrollY < 10) {
            setIsVisible(true);
          } 
          // Felfelé görgetés - mutassuk
          else if (currentScrollY < lastScrollY && Math.abs(currentScrollY - lastScrollY) > threshold) {
            setIsVisible(true);
          } 
          // Lefelé görgetés - rejtsük el
          else if (currentScrollY > lastScrollY && Math.abs(currentScrollY - lastScrollY) > threshold) {
            setIsVisible(false);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, threshold]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D9E2E9] bg-[#FFFBFC]/80 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {children}
    </header>
  );
}

