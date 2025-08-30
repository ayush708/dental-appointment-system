import { motion } from 'framer-motion'

const AboutPage = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            About DentalCare
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We are committed to providing exceptional dental care with a focus on 
            patient comfort and satisfaction. Our team of experienced professionals 
            uses the latest technology to deliver the best possible outcomes.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage
