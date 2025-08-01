import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function Navbar() {
  const navRef = useRef();
  const textRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    );

    gsap.fromTo(
      textRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.2, delay: 0.5, ease: 'elastic.out(1, 0.6)' }
    );
  }, []);

  return (
    <nav ref={navRef} className="bg-green-700 py-5 shadow-md text-center z-50 relative">
      <h1
        ref={textRef}
        className="text-white text-3xl font-extrabold tracking-wide drop-shadow-md"
      >
        🌱 Bharat Farming Intelligence
      </h1>
    </nav>
  );
}

export default Navbar;
