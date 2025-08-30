import {
    BookOpenIcon,
    CalendarIcon,
    ChatBubbleLeftIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ClockIcon,
    CogIcon,
    CreditCardIcon,
    EnvelopeIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    QuestionMarkCircleIcon,
    UserIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState } from 'react';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpenIcon },
    { id: 'appointments', name: 'Appointments', icon: CalendarIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'account', name: 'Account', icon: UserIcon },
    { id: 'technical', name: 'Technical', icon: CogIcon }
  ];

  const faqs = [
    {
      id: 1,
      category: 'appointments',
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment by clicking the "Book Appointment" button on your dashboard, selecting your preferred date and time, and choosing the type of service you need. You\'ll receive a confirmation email once your appointment is booked.'
    },
    {
      id: 2,
      category: 'appointments',
      question: 'Can I reschedule my appointment?',
      answer: 'Yes, you can reschedule your appointment up to 24 hours before the scheduled time. Go to your appointments page, find the appointment you want to reschedule, and click the "Reschedule" button.'
    },
    {
      id: 3,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and cash. We also offer payment plans for larger treatments.'
    },
    {
      id: 4,
      category: 'payments',
      question: 'How do I view my payment history?',
      answer: 'You can view your complete payment history in the "Payments" section of your dashboard. This includes all past transactions, receipts, and any outstanding balances.'
    },
    {
      id: 5,
      category: 'account',
      question: 'How do I update my personal information?',
      answer: 'To update your personal information, go to your profile settings. You can edit your contact details, emergency contacts, medical history, and preferences from there.'
    },
    {
      id: 6,
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click on the "Forgot Password" link on the login page. Enter your email address, and we\'ll send you a link to reset your password. Follow the instructions in the email to create a new password.'
    },
    {
      id: 7,
      category: 'technical',
      question: 'The website is running slowly. What should I do?',
      answer: 'Try clearing your browser cache and cookies, or try using a different browser. If the problem persists, please contact our technical support team.'
    },
    {
      id: 8,
      category: 'technical',
      question: 'Can I use the portal on my mobile device?',
      answer: 'Yes, our patient portal is fully responsive and works on all mobile devices. You can access all features through your mobile browser or download our mobile app.'
    }
  ];

  const quickLinks = [
    {
      title: 'Book an Appointment',
      description: 'Schedule your next visit',
      icon: CalendarIcon,
      color: 'blue',
      link: '/patient/book-appointment'
    },
    {
      title: 'View Medical History',
      description: 'Access your dental records',
      icon: BookOpenIcon,
      color: 'green',
      link: '/patient/medical-history'
    },
    {
      title: 'Payment Portal',
      description: 'Pay bills and view history',
      icon: CreditCardIcon,
      color: 'purple',
      link: '/patient/payments'
    },
    {
      title: 'Profile Settings',
      description: 'Update your information',
      icon: UserIcon,
      color: 'orange',
      link: '/patient/profile'
    }
  ];

  const contactOptions = [
    {
      method: 'Phone',
      value: '+1 (555) 123-4567',
      icon: PhoneIcon,
      color: 'blue',
      description: 'Call us for immediate assistance'
    },
    {
      method: 'Email',
      value: 'support@dentalcare.com',
      icon: EnvelopeIcon,
      color: 'green',
      description: 'Send us an email for non-urgent inquiries'
    },
    {
      method: 'Live Chat',
      value: 'Available 24/7',
      icon: ChatBubbleLeftIcon,
      color: 'purple',
      description: 'Chat with our support team'
    },
    {
      method: 'Video Call',
      value: 'Schedule a call',
      icon: VideoCameraIcon,
      color: 'red',
      description: 'Face-to-face support session'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
      case 'green':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400';
      case 'red':
        return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-2xl">
              <QuestionMarkCircleIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to your questions or get in touch with our support team
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <motion.a
                  key={index}
                  href={link.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
                >
                  <div className={`p-3 rounded-lg ${getColorClasses(link.color)} mb-4 w-fit`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {link.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {link.description}
                  </p>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories */}
            <div className="lg:w-1/4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* FAQ List */}
            <div className="lg:w-3/4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white pr-4">
                        {faq.question}
                      </h4>
                      {expandedFaq === faq.id ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-12">
                  <QuestionMarkCircleIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or browse different categories
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still need help?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our support team is here to assist you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:shadow-md transition-all"
                >
                  <div className={`p-3 rounded-lg ${getColorClasses(option.color)} mb-4 mx-auto w-fit`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {option.method}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                    {option.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Support Hours */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
              <ClockIcon className="w-5 h-5" />
              <span className="font-medium">Support Hours:</span>
              <span>Monday - Friday: 8:00 AM - 6:00 PM EST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
