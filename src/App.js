import React, { useState, useEffect } from "react";
import axios from "axios";

interface FormField {
  fieldId: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  dataTestId: string;
  validation?: {
    message: string,
  };
  options?: Array<{
    value: string,
    label: string,
    dataTestId?: string,
  }>;
  maxLength?: number;
  minLength?: number;
}

interface FormSection {
  sectionId: number;
  title: string;
  description: string;
  fields: FormField[];
}

interface FormResponse {
  message: string;
  form: {
    formTitle: string,
    formId: string,
    version: string,
    sections: FormSection[],
  };
}

export default function DynamicForm() {
  const [rollNumber, setRollNumber] = useState("");
  const [name, setName] = useState("");
  const [userCreated, setUserCreated] = useState(false);
  const [formData, setFormData] = (useState < FormResponse) | (null > null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [formValues, setFormValues] = useState < any > {};
  const [errors, setErrors] = useState < any > {};

  const handleRegister = async () => {
    try {
      await axios.post(
        "https://dynamic-form-generator-9rl7.onrender.com/create-user",
        {
          rollNumber,
          name,
        }
      );
      const { data } = await axios.get(
        `https://dynamic-form-generator-9rl7.onrender.com/get-form?rollNumber=${rollNumber}`
      );
      setFormData(data);
      setUserCreated(true);
    } catch (err) {
      alert("Error registering user or fetching form");
    }
  };

  const currentSection = formData?.form.sections[sectionIndex];

  const validateField = (field: FormField, value: any) => {
    if (field.required && !value) return `${field.label} is required.`;
    if (field.minLength && value.length < field.minLength)
      return `${field.label} must be at least ${field.minLength} characters.`;
    if (field.maxLength && value.length > field.maxLength)
      return `${field.label} must be less than ${field.maxLength} characters.`;
    return "";
  };

  const validateSection = () => {
    const newErrors: any = {};
    currentSection?.fields.forEach((field) => {
      const error = validateField(field, formValues[field.fieldId]);
      if (error) newErrors[field.fieldId] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (fieldId: string, value: any) => {
    setFormValues({ ...formValues, [fieldId]: value });
  };

  const handleNext = () => {
    if (validateSection()) {
      setSectionIndex(sectionIndex + 1);
    }
  };

  const handlePrev = () => {
    setSectionIndex(sectionIndex - 1);
  };

  const handleSubmit = () => {
    if (validateSection()) {
      console.log("Form Submitted:", formValues);
    }
  };

  if (!userCreated) {
    return (
      <div className="p-4">
        <h1 className="text-xl mb-2">Login</h1>
        <input
          type="text"
          placeholder="Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="block border p-2 mb-2"
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block border p-2 mb-2"
        />
        <button
          onClick={handleRegister}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{formData?.form.formTitle}</h1>
      <h2 className="text-xl mb-2">{currentSection?.title}</h2>
      <p className="mb-4">{currentSection?.description}</p>

      {currentSection?.fields.map((field) => (
        <div key={field.fieldId} className="mb-4">
          <label className="block mb-1">{field.label}</label>
          {field.type === "text" ||
          field.type === "email" ||
          field.type === "tel" ||
          field.type === "date" ||
          field.type === "textarea" ? (
            field.type === "textarea" ? (
              <textarea
                placeholder={field.placeholder}
                value={formValues[field.fieldId] || ""}
                onChange={(e) => handleChange(field.fieldId, e.target.value)}
                className="w-full p-2 border"
              ></textarea>
            ) : (
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={formValues[field.fieldId] || ""}
                onChange={(e) => handleChange(field.fieldId, e.target.value)}
                className="w-full p-2 border"
              />
            )
          ) : null}

          {field.type === "dropdown" && field.options && (
            <select
              value={formValues[field.fieldId] || ""}
              onChange={(e) => handleChange(field.fieldId, e.target.value)}
              className="w-full p-2 border"
            >
              <option value="">Select</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {errors[field.fieldId] && (
            <p className="text-red-500 text-sm mt-1">{errors[field.fieldId]}</p>
          )}
        </div>
      ))}

      <div className="flex justify-between">
        {sectionIndex > 0 && (
          <button
            onClick={handlePrev}
            className="bg-gray-500 text-white px-4 py-2"
          >
            Prev
          </button>
        )}
        {sectionIndex < (formData?.form.sections.length ?? 0) - 1 && (
          <button
            onClick={handleNext}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Next
          </button>
        )}
        {sectionIndex === (formData?.form.sections.length ?? 0) - 1 && (
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
