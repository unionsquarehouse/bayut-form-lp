"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaGlobe,
  FaFileExcel,
  FaUpload,
} from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import * as XLSX from "xlsx";

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("manual"); // "manual" or "excel"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Excel upload states
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [excelUploadSuccess, setExcelUploadSuccess] = useState(false);
  const [excelErrors, setExcelErrors] = useState([]);

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

  // File handling functions for both Excel and CSV
  const handleFile = (file) => {
    setExcelFile(file);
    setExcelErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (fileExtension === "csv") {
          // Handle CSV files
          const csvText = e.target.result;
          const jsonData = parseCSV(csvText);
          const processedData = processExcelData(jsonData);
          setExcelData(processedData);
        } else {
          // Handle Excel files
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const processedData = processExcelData(jsonData);
          setExcelData(processedData);
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        setExcelErrors([
          "Error parsing file. Please check the format and try again.",
        ]);
      }
    };

    if (file.name.split(".").pop().toLowerCase() === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i]
          .split(",")
          .map((v) => v.trim().replace(/"/g, ""));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        data.push(row);
      }
    }

    return data;
  };

  const processExcelData = (data) => {
    if (!data || data.length === 0) return [];

    // Check which type of Excel file this is based on column headers
    const firstRow = data[0];
    const headers = Object.keys(firstRow);

    // Type 1: Date, Lead Name, Lead Number, Project Name, Project Location
    if (
      headers.some((h) => h.toLowerCase().includes("date")) &&
      headers.some((h) => h.toLowerCase().includes("lead name"))
    ) {
      return data.map((row) => ({
        name: row["Lead Name"] || "",
        phone: convertScientificNotation(row["Lead Number"]),
        projectName: row["Project Name"] || "",
        projectLocation: row["Project Location"] || "",
        date: row["Date"] || "",
        source: "UC_IU4ROJ", // Default to Bayut Campaign
      }));
    }

    // Type 2: Phone Nu, Email, Project Na, Developer, Source, Status, etc.
    if (
      headers.some((h) => h.toLowerCase().includes("phone number")) &&
      headers.some((h) => h.toLowerCase().includes("email"))
    ) {
      return data.map((row) => ({
        name: row["Email"] || "",
        email: row["Email"] || "",
        phone: convertScientificNotation(row["Phone Number"]),
        projectName: row["Project Name"] || "",
        developer: row["Developer"] || "",
        budget: row["Budget"] || "",
        residency: row["Residency"] || "",
        timeToInvest: row["Time To Invest"] || "",        
      }));
    }

    return data;
  };

  const convertScientificNotation = (value) => {
    if (!value) return "";
    if (typeof value === "number") {
      return value.toString();
    }
    if (typeof value === "string" && value.includes("E+")) {
      return parseFloat(value).toString();
    }
    return value.toString();
  };

  const handleExcelUpload = async () => {
    if (!excelData || excelData.length === 0) {
      setExcelErrors(["No data to upload. Please select a valid Excel file."]);
      return;
    }

    setIsProcessingExcel(true);
    setExcelErrors([]);

    try {
      const uploadPromises = excelData.map(async (lead, index) => {
        try {
          const response = await fetch("/api/leads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(lead),
          });

          if (!response.ok) {
            throw new Error(`Row ${index + 1}: ${response.statusText}`);
          }

          return { success: true, index: index + 1 };
        } catch (error) {
          return { success: false, index: index + 1, error: error.message };
        }
      });

      const results = await Promise.all(uploadPromises);
      const errors = results.filter((r) => !r.success);
      const successes = results.filter((r) => r.success);

      if (errors.length > 0) {
        setExcelErrors(errors.map((e) => `Row ${e.index}: ${e.error}`));
      }

      if (successes.length > 0) {
        setExcelUploadSuccess(true);
        setTimeout(() => {
          setExcelUploadSuccess(false);
          setExcelData([]);
          setExcelFile(null);
        }, 3000);
      }
    } catch (error) {
      setExcelErrors(["Error processing file. Please try again."]);
    } finally {
      setIsProcessingExcel(false);
    }
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
      source: formData.source,
      message: formData.message,
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
            source: "",
            message: "",
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
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden bg-[url('/assets/hero-bg.jpg')] bg-cover bg-center "
    >
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
            {submitSuccess || excelUploadSuccess ? (
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
                  {submitSuccess
                    ? "Lead has been submitted successfully."
                    : "File processed successfully!"}
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
                <h3 className="text-[2.5rem] 2xl:text-[3rem]  mb-4 xl:mb-8 text-white text-center">
                  Project Leads
                </h3>

                {/* Tab Navigation */}
                <div className="flex mb-6 bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("manual")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "manual"
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Manual Entry
                  </button>
                  <button
                    onClick={() => setActiveTab("excel")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "excel"
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    File Upload
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "manual" ? (
                    <motion.div
                      key="manual"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
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
                                formErrors.name
                                  ? "border-red-500"
                                  : "border-white/20"
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
                            htmlFor="source"
                            className="block text-xs xl:text-[1.1rem] text-white/80 mb-1 xl:mb-2 ml-1"
                          >
                            Source
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                              <FaGlobe className="text-xs xl:text-[1.1rem]" />
                            </div>
                            <select
                              id="source"
                              name="source"
                              value={formData.source}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2 bg-white/10 border ${
                                formErrors.source
                                  ? "border-red-500"
                                  : "border-white/20"
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-black text-sm`}
                            >
                              <option value="" disabled>
                                Select source
                              </option>
                              <option className="text-black" value="UC_IU4ROJ">
                                Bayut Campaign
                              </option>
                              <option className="text-black" value="UC_59XMT3">
                                PF Campaign
                              </option>
                            </select>
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
                    </motion.div>
                  ) : (
                    <motion.div
                      key="excel"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Excel Upload Area */}
                      <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                        <FaFileExcel className="mx-auto text-4xl text-green-400 mb-4" />
                        <h4 className="text-lg font-semibold text-white mb-2">
                          Upload File
                        </h4>
                        <p className="text-sm text-white/70 mb-4">
                          Supported formats: .xlsx, .xls, .csv
                        </p>

                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors"
                        >
                          <FaUpload className="mr-2" />
                          Choose File
                        </label>

                        {excelFile && (
                          <p className="text-sm text-green-400 mt-2">
                            Selected: {excelFile.name}
                          </p>
                        )}
                      </div>

                      {/* Excel Data Preview */}
                      {excelData.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-semibold mb-2">
                            Preview ({excelData.length} records)
                          </h5>
                          <div className="max-h-40 overflow-y-auto">
                            <div className="text-xs text-white/70 space-y-1">
                              {excelData.slice(0, 3).map((row, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between"
                                >
                                  <span>{row.name || "N/A"}</span>
                                  <span>{row.phone || "N/A"}</span>
                                </div>
                              ))}
                              {excelData.length > 3 && (
                                <div className="text-center text-white/50">
                                  ... and {excelData.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error Messages */}
                      {excelErrors.length > 0 && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                          <h6 className="text-red-400 font-semibold mb-2">
                            Errors:
                          </h6>
                          <ul className="text-sm text-red-300 space-y-1">
                            {excelErrors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Upload Button */}
                      <motion.button
                        onClick={handleExcelUpload}
                        disabled={!excelData.length || isProcessingExcel}
                        className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 font-medium py-2 px-4 rounded transition duration-300 flex items-center justify-center text-sm xl:text-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {isProcessingExcel ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-400"
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
                          `Upload ${excelData.length} Records`
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
