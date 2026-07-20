import { Link, useLocation } from 'wouter';
import { Settings, Music, Layers, Radio } from 'lucide-react';

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: '/', icon: Radio, label: 'Studio' },
    { href: '/playlists', icon: Music, label: 'Playlists' },
    { href: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-20 flex-col items-center py-6 glass-panel border-y-0 border-l-0 rounded-none z-50">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            <Layers className="w-6 h-6 text-black" />
          </div>
        </div>

        <nav className="flex flex-col gap-6 flex-1 w-full items-center mt-4">
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href} className="w-full flex justify-center group relative">
                <div className={`p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,212,255,0.2)]' : 'text-muted-foreground hover:bg-white/10 hover:text-white'}`}>
                  <link.icon className="w-6 h-6" />
                </div>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-x-0 border-b-0 rounded-none z-50 flex items-center justify-around px-4">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center gap-1 group">
              <div className={`p-2 rounded-lg transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <link.icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
