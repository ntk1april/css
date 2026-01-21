import React from "react";

const Footer = () => {
  return (
    <footer className="gradient-primary mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white text-center md:text-left">
            <p className="font-semibold">POS System</p>
            <p className="text-sm text-indigo-100">Point of Sale Management</p>
          </div>
          <div className="text-white text-center md:text-right">
            <p className="text-sm text-indigo-100">
              © 2026 | Built with Next.js
            </p>
            <p className="text-xs text-indigo-200 mt-1">
              Developed by NTK1APRiL
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
