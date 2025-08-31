import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-800">
      <div className="container-safe py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-glow flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">DentalCare</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-base">
              Providing exceptional dental care with modern technology and compassionate service.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                  Services
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/services" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      General Dentistry
                    </Link>
                  </li>
                  <li>
                    <Link to="/services" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Cosmetic Dentistry
                    </Link>
                  </li>
                  <li>
                    <Link to="/services" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Orthodontics
                    </Link>
                  </li>
                  <li>
                    <Link to="/services" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Oral Surgery
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/about" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link to="/careers" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/help" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      Contact Support
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            © {new Date().getFullYear()} DentalCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
