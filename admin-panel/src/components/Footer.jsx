export default function Footer() {
  return (
    <footer className="p-8 mt-auto border-t border-[#E8DDD1] flex flex-col md:flex-row justify-between items-center text-[#8B8680] text-xs gap-4">
      <p>© 2024 Smart Website Control Panel. All rights reserved.</p>
      <div className="flex items-center gap-6">
        <a href="#" className="hover:text-[#3D3A34] transition-colors">Documentation</a>
        <a href="#" className="hover:text-[#3D3A34] transition-colors">Support Portal</a>
        <a href="#" className="flex items-center gap-1.5 hover:text-[#3D3A34]">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          All Systems Operational
        </a>
      </div>
    </footer>
  );
}
