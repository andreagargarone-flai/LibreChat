/**
 * Custom Header Wrapper
 * This file wraps the original Header component and adds a custom logo
 * It's designed to be merge-safe - updates to the original Header will work automatically
 */
import Header from './Header';

export default function CustomHeader() {
  return (
    <div className="custom-header-wrapper">
      {/* Original Header */}
      <Header />
    </div>
  );
}
