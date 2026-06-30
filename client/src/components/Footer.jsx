import { Link } from 'react-router-dom';
import { FiPhone, FiLinkedin, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-bold text-white text-lg">
                UOK <span className="text-green-500">Connect</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Bridging students of the University of Kelaniya with companies and
              opportunities. Showcase your projects, get noticed.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="tel:+94712345678" className="p-2 hover:bg-gray-800 rounded-lg transition-colors hover:text-white">
                <FiPhone size={17} />
              </a>
              <a href="#" className="p-2 hover:bg-gray-800 rounded-lg transition-colors hover:text-white">
                <FiLinkedin size={17} />
              </a>
              <a href="mailto:connect@kln.ac.lk" className="p-2 hover:bg-gray-800 rounded-lg transition-colors hover:text-white">
                <FiMail size={17} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/projects', label: 'All Projects' },
                { to: '/students', label: 'Students' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Students</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/auth/login', label: 'Sign In' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/projects/new', label: 'Add Project' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">
            © {new Date().getFullYear()} UOK Connect · Faculty of Computing, University of Kelaniya
          </p>
          <p className="text-xs">Built by the Development Team</p>
        </div>
      </div>
    </footer>
  );
}
