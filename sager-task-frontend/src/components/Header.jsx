import '../assets/Header.css';
import Logo from '../assets/SagerLogo.png';
import captureIcon from '../assets/capture-svgrepo-com.svg';
import globelIcon from '../assets/language-svgrepo-com.svg';
import bellIcon from '../assets/bell.svg';
import { useState, useEffect } from 'react';

function Header() {
  const [sidePanelVisible, setSidePanelVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Toggle side panel visibility
  const toggleSidePanel = () => {
    setSidePanelVisible(!sidePanelVisible);
    // Dispatch event for other components to listen to
    const event = new CustomEvent('toggleSidePanel', { detail: { visible: !sidePanelVisible } });
    window.dispatchEvent(event);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="header">
      <div className="left-section">
        <div className="logo">
          <img src={Logo} alt="Sager Logo" className="logo-img" />
        </div>
        <button 
          className={`side-panel-btn ${sidePanelVisible ? 'active' : ''}`}
          onClick={toggleSidePanel}
        >
          Side Panel
        </button>
      </div>
      
      {/* Hamburger button for mobile */}
      <button className="hamburger-btn" onClick={toggleMobileMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div className={`right-section ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <span className="icon">
          <img src={captureIcon} alt="Capture" style={{ width: 24, height: 24 }} />
        </span>
        <span className="icon">
          <img src={globelIcon} alt="Language" style={{ width: 24, height: 24 }} />
        </span>
        <span className="icon bell">
          <img src={bellIcon} alt="Bell" style={{ width: 24, height: 24 }} />
          <span className="notification">8</span>
        </span>
        <div className="user-support">
          <span className="user">Hello, Mohannad Salameh</span>
          <span className="support">Technical Support</span>
        </div>
      </div>
    </header>
  );
}

export default Header;