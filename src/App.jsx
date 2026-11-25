import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Translator from './components/Translator';
import WhyShawer from './components/WhyShawer';
import About from './components/About';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Toast from './components/Toast';
import './App.css';

export default function App() {
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  const notify = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast({ show: false, message: '', isError: false });
    }, 3500);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main>
        <Hero />
        <Translator onNotify={notify} />
        <WhyShawer />
        {/* <About />
        <Reviews />
        <Contact onNotify={notify} /> */}
      </main>
      <Footer />
      <Toast toast={toast} />
    </div>
  );
}
