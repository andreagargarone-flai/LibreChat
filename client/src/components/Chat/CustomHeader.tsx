/**
 * Custom Header Wrapper
 * This file wraps the original Header component and adds a custom logo
 * It's designed to be merge-safe - updates to the original Header will work automatically
 */
import Header from './Header';

export default function CustomHeader() {
  return (
    <div className="custom-header-wrapper">
      {/* Custom Logo */}
      <div className="custom-logo-container">
        <img
          src="/assets/logo.png"
          alt="Logo"
          className="custom-logo"
          onError={(e) => {
            // Fallback if logo doesn't exist
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Original Header */}
      <Header />
    </div>
  );
}
