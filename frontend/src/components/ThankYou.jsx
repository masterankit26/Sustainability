import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

function ThankYou() {
  const sectionRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'power3.out',
      }
    );

    gsap.fromTo(
      contentRef.current,
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        delay: 0.5,
        ease: 'back.out(1.7)',
      }
    );
  }, []);

  return (
    <div
      ref={sectionRef}
      className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-10 mt-16 border border-green-100 text-center"
    >
      <div ref={contentRef}>
        <h1 className="text-4xl font-extrabold text-green-700 mb-4">🎉 Thank You!</h1>
        <p className="text-gray-700 text-lg mb-6">
          We appreciate your time and interest in our Smart Farming Solution. Your support inspires innovation!
        </p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-inner mt-6 text-left">
          <h2 className="text-xl font-bold text-green-800 mb-3">👥 Team Information</h2>
          <ul className="space-y-2 text-gray-800 text-[15.5px]">
            <li><strong>Team Code:</strong> TFT087</li>
            <li><strong>Team Name:</strong> Study Hub</li>
            <li><strong>Team Leader:</strong> Ankit Shaw</li>
            <li><strong>Team Member 2:</strong> Ansh Shaw</li>
            <li><strong>Team Member 3:</strong> Amal Kumar Singh</li>
          </ul>
        </div>

        <p className="mt-8 text-gray-600 italic text-sm">
          — Presented with dedication by Team Study Hub 🌾💡
        </p>
      </div>
    </div>
  );
}

export default ThankYou;
