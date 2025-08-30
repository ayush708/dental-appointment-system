import {
    ClockIcon,
    DevicePhoneMobileIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    EyeIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: UserIcon,
      content: [
        'Personal identification information (Name, email address, phone number)',
        'Medical and dental history information',
        'Insurance information and payment details',
        'Appointment history and preferences',
        'Communication records with our office',
        'Website usage data and cookies'
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: EyeIcon,
      content: [
        'Providing dental care and treatment services',
        'Scheduling and managing appointments',
        'Processing payments and insurance claims',
        'Communicating about your care and appointments',
        'Improving our services and patient experience',
        'Complying with legal and regulatory requirements'
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: DocumentTextIcon,
      content: [
        'We do not sell your personal information to third parties',
        'Information may be shared with insurance providers for claims processing',
        'Medical information may be shared with referring doctors or specialists',
        'Legal compliance may require sharing information with authorities',
        'Service providers may access limited information to support our services',
        'Emergency situations may require sharing medical information'
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: LockClosedIcon,
      content: [
        'Industry-standard encryption for data transmission and storage',
        'Secure servers with regular security updates and monitoring',
        'Limited access to patient information on a need-to-know basis',
        'Regular staff training on privacy and security protocols',
        'HIPAA-compliant practices and procedures',
        'Regular security audits and assessments'
      ]
    },
    {
      id: 'patient-rights',
      title: 'Your Rights',
      icon: ShieldCheckIcon,
      content: [
        'Access and review your personal and medical information',
        'Request corrections to inaccurate information',
        'Request restrictions on how your information is used',
        'Receive communications in a specific manner or location',
        'File complaints about privacy practices',
        'Receive a copy of this privacy notice'
      ]
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies and Tracking',
      icon: DevicePhoneMobileIcon,
      content: [
        'Essential cookies for website functionality and security',
        'Analytics cookies to understand website usage patterns',
        'Preference cookies to remember your settings',
        'You can disable cookies through your browser settings',
        'Some features may not work properly without cookies',
        'We do not use cookies for advertising purposes'
      ]
    }
  ];

  const contactInfo = [
    {
      method: 'Email',
      value: 'privacy@dentalcare.com',
      icon: EnvelopeIcon,
      description: 'For privacy-related inquiries'
    },
    {
      method: 'Phone',
      value: '+1 (555) 123-4567',
      icon: DevicePhoneMobileIcon,
      description: 'Speak with our privacy officer'
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
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-2xl">
              <ShieldCheckIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
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
              At DentalCare, we are committed to protecting your privacy and maintaining the confidentiality of your personal and medical information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>
            <p>
              We comply with all applicable privacy laws, including the Health Insurance Portability and Accountability Act (HIPAA), and follow industry best practices to ensure your information remains secure.
            </p>
          </div>
        </motion.div>

        {/* Privacy Sections */}
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
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 dark:text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Data Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Data Retention
          </h3>
          <div className="text-gray-600 dark:text-gray-400 space-y-3">
            <p>
              We retain your personal and medical information for as long as necessary to provide you with dental care services and as required by law. Generally, medical records are retained for a minimum of 7 years after your last visit, or longer if required by state law.
            </p>
            <p>
              When information is no longer needed, it is securely destroyed using industry-standard methods to ensure your privacy is maintained.
            </p>
          </div>
        </motion.div>

        {/* Children's Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Children's Privacy
          </h3>
          <div className="text-gray-600 dark:text-gray-400 space-y-3">
            <p>
              We take special care to protect the privacy of children under 13 years of age. We do not knowingly collect personal information from children under 13 without parental consent, except as permitted by law for treatment purposes.
            </p>
            <p>
              Parents or guardians have the right to review, request deletion of, and refuse further collection of their child's personal information.
            </p>
          </div>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Changes to This Policy
          </h3>
          <div className="text-gray-600 dark:text-gray-400 space-y-3">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.
            </p>
            <p>
              We encourage you to review this policy periodically to stay informed about how we protect your information.
            </p>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact Us About Privacy
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {contact.method}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 font-medium">
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
              Mailing Address
            </h4>
            <div className="text-gray-600 dark:text-gray-400">
              <p>DentalCare Privacy Officer</p>
              <p>123 Dental Street</p>
              <p>Health City, HC 12345</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
