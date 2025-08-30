import {
    ClockIcon,
    CreditCardIcon,
    DevicePhoneMobileIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    ScaleIcon,
    ShieldCheckIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const TermsPage = () => {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: ScaleIcon,
      content: [
        'By accessing our website or using our services, you agree to these terms',
        'These terms apply to all users, including patients and visitors',
        'If you do not agree with these terms, please do not use our services',
        'Your continued use constitutes acceptance of any updates to these terms'
      ]
    },
    {
      id: 'services',
      title: 'Our Services',
      icon: UserIcon,
      content: [
        'We provide dental care services including examinations, cleanings, and treatments',
        'Online appointment scheduling and patient portal access',
        'Treatment planning and consultation services',
        'Emergency dental care when available',
        'Educational resources and oral health information',
        'Insurance processing and payment services'
      ]
    },
    {
      id: 'patient-responsibilities',
      title: 'Patient Responsibilities',
      icon: ShieldCheckIcon,
      content: [
        'Provide accurate and complete medical and dental history',
        'Arrive on time for scheduled appointments or provide adequate notice of cancellation',
        'Follow post-treatment care instructions as provided',
        'Maintain good oral hygiene as recommended',
        'Report any adverse reactions or complications promptly',
        'Keep contact and insurance information current'
      ]
    },
    {
      id: 'appointments',
      title: 'Appointments and Cancellations',
      icon: ClockIcon,
      content: [
        'Appointments must be scheduled in advance through our booking system',
        'Cancellations must be made at least 24 hours in advance',
        'Late cancellations or no-shows may result in fees',
        'Emergency appointments are subject to availability',
        'We reserve the right to reschedule appointments when necessary',
        'Repeated no-shows may result in dismissal from the practice'
      ]
    },
    {
      id: 'payment-terms',
      title: 'Payment Terms',
      icon: CreditCardIcon,
      content: [
        'Payment is due at the time of service unless other arrangements are made',
        'We accept cash, credit cards, and approved payment plans',
        'Insurance claims will be filed on your behalf when applicable',
        'You are responsible for knowing your insurance benefits and limitations',
        'Unpaid balances may be subject to collection procedures',
        'Returned checks may incur additional fees'
      ]
    },
    {
      id: 'limitations',
      title: 'Limitations and Disclaimers',
      icon: ExclamationTriangleIcon,
      content: [
        'Treatment outcomes cannot be guaranteed and may vary by individual',
        'We are not liable for treatment complications beyond our control',
        'Our liability is limited to the cost of the specific treatment provided',
        'Emergency situations may require immediate referral to other providers',
        'Some treatments may require multiple visits or additional procedures',
        'Insurance coverage and benefits are determined by your insurance provider'
      ]
    }
  ];

  const contactInfo = [
    {
      method: 'Email',
      value: 'legal@dentalcare.com',
      icon: EnvelopeIcon,
      description: 'For legal and terms-related inquiries'
    },
    {
      method: 'Phone',
      value: '+1 (555) 123-4567',
      icon: DevicePhoneMobileIcon,
      description: 'Speak with our office manager'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-2xl">
              <DocumentTextIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Please read these terms carefully before using our services. These terms govern your relationship with our dental practice.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-500 dark:text-gray-400"
          >
            <ClockIcon className="w-4 h-4" />
            <span>Last updated: January 1, 2024</span>
          </motion.div>
        </div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Introduction
          </h2>
          <div className="text-gray-600 dark:text-gray-400 space-y-3">
            <p>
              Welcome to DentalCare. These Terms of Service ("Terms") govern your use of our website, online services, and dental care services. By using our services, you enter into a binding agreement with us and agree to comply with these terms.
            </p>
            <p>
              These terms are designed to ensure a positive experience for all patients while establishing clear expectations and responsibilities for both parties.
            </p>
          </div>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <IconComponent className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 dark:text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Website Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Website Usage
          </h3>
          <div className="text-gray-600 dark:text-gray-400 space-y-3">
            <p>
              Our website is provided for informational and service purposes. You may not use our website for any unlawful purpose or in any way that could damage or impair our services.
            </p>
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">Prohibited activities include:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Attempting to gain unauthorized access to our systems</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Transmitting harmful code or malicious software</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Using our services for fraudulent purposes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Violating intellectual property rights</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Privacy and Confidentiality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Privacy and Confidentiality
          </h3>
          <div className="text-gray-600 dark:text-gray-400 space-y-3">
            <p>
              We are committed to protecting your privacy and maintaining the confidentiality of your medical information in accordance with HIPAA and other applicable laws. Please refer to our Privacy Policy for detailed information about how we handle your data.
            </p>
            <p>
              By using our services, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy.
            </p>
          </div>
        </motion.div>

        {/* Modifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Modifications to Terms
          </h3>
          <div className="text-gray-600 dark:text-gray-400 space-y-3">
            <p>
              We reserve the right to modify these terms at any time. Material changes will be communicated through our website or direct notification. Your continued use of our services after changes are posted constitutes acceptance of the modified terms.
            </p>
            <p>
              We recommend reviewing these terms periodically to stay informed of any updates.
            </p>
          </div>
        </motion.div>

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Governing Law and Disputes
          </h3>
          <div className="text-gray-600 dark:text-gray-400 space-y-3">
            <p>
              These terms are governed by the laws of the state in which our practice operates. Any disputes arising from these terms or our services will be resolved through binding arbitration or in the courts of our local jurisdiction.
            </p>
            <p>
              We encourage open communication to resolve any concerns before pursuing formal dispute resolution procedures.
            </p>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Questions About These Terms
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <IconComponent className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {contact.method}
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-medium">
                      {contact.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Office Address
            </h4>
            <div className="text-gray-600 dark:text-gray-400">
              <p>DentalCare Practice</p>
              <p>123 Dental Street</p>
              <p>Health City, HC 12345</p>
            </div>
          </div>
        </motion.div>

        {/* Acknowledgment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mt-8 text-center border border-gray-200 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400">
            By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
