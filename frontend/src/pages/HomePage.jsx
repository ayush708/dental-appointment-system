import {
    ClockIcon,
    HeartIcon,
    MapPinIcon,
    PhoneIcon,
    StarIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const HomePage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white py-20 hero-surface">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container-safe">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Smile is Our
              <span className="block text-yellow-400">Priority</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Experience world-class dental care with our team of expert dentists 
              and state-of-the-art technology.
            </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-modern bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:from-yellow-500 hover:to-yellow-600"
              >
                Book Appointment
              </Link>
              <Link
                to="/about"
        className="btn-glass font-semibold"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-safe">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Why Choose DentalCare?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              We provide comprehensive dental services with a focus on comfort, 
              quality, and patient satisfaction.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: UserGroupIcon,
                title: 'Expert Team',
                description: 'Our experienced dentists and staff are committed to providing exceptional care.',
                color: 'blue'
              },
              {
                icon: HeartIcon,
                title: 'Gentle Care',
                description: 'We prioritize your comfort and use the latest techniques for pain-free treatments.',
                color: 'red'
              },
              {
                icon: StarIcon,
                title: 'Modern Technology',
                description: 'State-of-the-art equipment ensures precise diagnosis and effective treatments.',
                color: 'yellow'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-medium hover:shadow-hard transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className={`w-16 h-16 bg-${feature.color}-100 dark:bg-${feature.color}-900/20 rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
  <div className="container-safe">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Our Services
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              From routine cleanings to complex procedures, we offer comprehensive 
              dental care for the whole family.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              'General Dentistry',
              'Cosmetic Dentistry',
              'Orthodontics',
              'Oral Surgery',
              'Pediatric Dentistry',
              'Dental Implants',
              'Root Canal Treatment',
              'Teeth Whitening'
            ].map((service, index) => (
              <motion.div
                key={service}
                variants={fadeInUp}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300 cursor-pointer border border-gray-200 dark:border-gray-700"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white text-center">
                  {service}
                </h4>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/services"
              className="btn-modern"
            >
              View All Services
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <motion.div variants={fadeInUp}>
              <PhoneIcon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-blue-100">+1 (555) 123-4567</p>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <MapPinIcon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Visit Us</h3>
              <p className="text-blue-100">123 Dental Street, City, State 12345</p>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <ClockIcon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Hours</h3>
              <p className="text-blue-100">Mon-Fri: 8AM-6PM<br />Sat: 9AM-3PM</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
