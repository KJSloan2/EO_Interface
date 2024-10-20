import React, { useState, useRef, useLayoutEffect } from 'react';
import { D3BoxTest } from './D3BoxTest';
import Description from './Description';
import { DeckLstf } from './DeckLandsat';
import { DeckLandsat } from './DeckLandsat';
import './App.css';

export default function App() {
  const [expandedSection, setExpandedSection] = useState('left'); // Track which section is expanded
  const rightSectionRef = useRef(null); // Reference for right section div
  const [rightSectionWidth, setRightSectionWidth] = useState(0); // Track width for right section

  // Handle section toggle to update which section is expanded
  const handleToggle = (section) => {
    setExpandedSection(section);
  };

  // Dynamically assign `flex-grow` for smooth transition
  const getFlexGrow = (section) => (expandedSection === section ? 8 : .1);

  const [d3BoxArea, setD3BoxArea] = useState(10000);
  const [d3BoxHeight, setD3BoxHeight] = useState(2);

  // Track the width of the right section for dynamic rendering
  useLayoutEffect(() => {
    if (rightSectionRef.current) {
      const updateWidth = () => {
        setRightSectionWidth(rightSectionRef.current.getBoundingClientRect().width);
      };
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [expandedSection]);

  return (
    <div className="container">
      <div className="sidebar">
        <div className="toggle-container">
          <button onClick={() => handleToggle('left')}>About</button>
          <button onClick={() => handleToggle('center')}>Process</button>
          <button onClick={() => handleToggle('right')}>Landsat</button>
          <button onClick={() => handleToggle('deckNdvi')}>3Dep</button>
        </div>
      </div>

      {/* Left Section */}
      <div
        className="section left-section"
        style={{ flexGrow: getFlexGrow('left') }}
      >
        {expandedSection === 'left' && <Description />}
        
      </div>

      {/* Center Section */}
      <div
        className="section center-section"
        style={{ flexGrow: getFlexGrow('center') }}
      >
        
      </div>
      {/* Right Section */}
      <div
        className="section right-section"
        style={{ flexGrow: getFlexGrow('right') }}
        ref={rightSectionRef}
      >
        {expandedSection === 'right' && (
          <div className="deck">
            <DeckLandsat
              selectedTile={'/A0_2013_0-1_V1.json'}
              isRightSelected={expandedSection === 'right'}
              rightSectionWidth={rightSectionWidth}
            />
          </div>
          )}
      </div>
      <div
        className="section deckNdvi-section"
        style={{ flexGrow: getFlexGrow('deckNdvi') }}
        ref={rightSectionRef}
      >
        {expandedSection === 'deckNdvi' && (
          <div className="deck">
            <DeckNdvi
              selectedTile={'/A0_2013_0-1_V1.json'}
              isRightSelected={expandedSection === 'deckNdvi'}
              rightSectionWidth={rightSectionWidth}
            />
          </div>
          )}
      </div>
    </div>
  );
}
