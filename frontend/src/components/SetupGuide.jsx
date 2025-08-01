import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function SetupGuide() {
  const sectionRef = useRef();
  const itemsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      }
    );

    gsap.fromTo(
      itemsRef.current,
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      }
    );
  }, []);

  const steps = [
    {
      title: 'Installation & Setup:',
      desc: 'Install soil moisture sensors across farm zones. Our team assists with calibration and mapping to ensure reliable readings.',
    },
    {
      title: 'Dashboard Monitoring:',
      desc: 'Access real-time soil data, weather, and water usage via a user-friendly web/mobile dashboard.',
    },
    {
      title: 'Automated Operation:',
      desc: 'Irrigation is managed automatically based on crop needs, sensor feedback, and forecast data.',
    },
    {
      title: 'Alerts & Reports:',
      desc: 'Instant alerts for equipment issues. Monthly reports show water usage, crop trends, and system efficiency.',
    },
    {
      title: 'Manual Override & Customization:',
      desc: 'Farmers can override automated actions anytime for flexible control during special conditions.',
    },
  ];

  return (
    <div
      ref={sectionRef}
      className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md border border-green-100 shadow-2xl rounded-2xl px-8 py-10 mt-16"
    >
      <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
        🛠️ <span className="ml-2">System Setup & Usage</span>
      </h2>
      <ul className="list-disc ml-6 space-y-5 text-gray-800 text-[15.7px] leading-relaxed">
        {steps.map((step, i) => (
          <li
            key={i}
            ref={(el) => (itemsRef.current[i] = el)}
            className="transition duration-300 hover:pl-1"
          >
            <strong className="text-green-700">{step.title}</strong>{' '}
            <span className="text-gray-700">{step.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SetupGuide;
