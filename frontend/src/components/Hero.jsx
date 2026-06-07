import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <div className="hero">
      <motion.div
        className="hero-icon"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        🌿
      </motion.div>
      <h1>Plant Disease Detection</h1>
      <p>AI‑powered diagnosis – upload a leaf photo or use your camera to get instant results.</p>
    </div>
  );
};

export default Hero;