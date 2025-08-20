"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";

export default function HeroSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Prepare data for our API endpoint
    const leadData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      preferredUnitType: formData.preferredUnitType,
    };
    console.log(leadData);

    // Send POST request to our API endpoint
    fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Lead created successfully:", data);
        setIsSubmitting(false);
        setSubmitSuccess(true);

        // Reset form after showing success message
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            phone: "",
            priceRange: "1M-2M AED",
            bedrooms: "1",
          });
          setFormErrors({});
          setSubmitSuccess(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error creating lead:", error);
        setIsSubmitting(false);
        setFormErrors((prev) => ({
          ...prev,
          submission:
            "There was an error submitting your request. Please try again.",
        }));
      });
  };

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-[url('/assets/hero-bg.jpg')] bg-cover bg-center ">
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-black/50"></div>
      {/* Content Container - Match other sections */}
      <div className="w-[100vw] md:w-[80vw] mx-auto px-4 py-20 relative z-10 min-h-screen flex items-center">
        <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-center md:gap-12">
          {/* Left side - Enhanced with logo and better typography */}

          <motion.div
            className="w-full md:w-2/5 bg-white/10 backdrop-blur-lg p-5 md:px-6 md:py-10 rounded-[2rem] border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {submitSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-base font-bold mb-2 text-white">
                  Thank You!
                </h3>
                <p className="text-xs xl:text-[1.1rem] text-gray-300">
                  Your interest has been registered. Our team will contact you
                  shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="relative w-26 h-12 mb-4 ">
                  <Image
                    src="/assets/ush_logo_light.svg"
                    alt="Hero Image"
                    layout="fill"
                    objectFit="contain"
                    className=" inset-0 -z-10"
                  />
                </div>
                <h3 className="text-[1.5rem] 2xl:text-[2rem]  mb-4 xl:mb-8 text-white text-center">
                  Bayut Project Leads
                </h3>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 xl:space-y-6"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs xl:text-[1.1rem] text-white/80 mb-1 xl:mb-2 ml-1"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaUserAlt className="text-xs xl:text-[1.1rem]" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 bg-white/10 border ${
                          formErrors.name ? "border-red-500" : "border-white/20"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400 text-sm`}
                        placeholder="John Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs xl:text-[1.1rem] text-white/80 mb-1 xl:mb-2 ml-1"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaEnvelope className="text-xs xl:text-[1.1rem]" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 bg-white/10 border ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-white/20"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400 text-sm`}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs xl:text-[1.1rem] text-white/80 mb-1 xl:mb-2 ml-1"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaPhoneAlt className="text-xs xl:text-[1.1rem]" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 bg-white/10 border ${
                          formErrors.phone
                            ? "border-red-500"
                            : "border-white/20"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400 text-sm`}
                        placeholder="+971 50 123 4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs xl:text-[1.1rem] text-white/80 mb-1 xl:mb-2 ml-1"
                    >
                      Message
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaMessage className="text-xs xl:text-[1.1rem]" />
                      </div>
                      <input
                        type="text"
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 bg-white/10 border ${
                          formErrors.message
                            ? "border-red-500"
                            : "border-white/20"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400 text-sm`}
                        placeholder="message"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white/10 hover:bg-black/50 text-white hover:text-white font-medium py-2 px-4 rounded transition duration-300 flex items-center justify-center text-sm xl:text-xl mt-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
